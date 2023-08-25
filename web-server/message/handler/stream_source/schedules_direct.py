import message.handler.stream_source.base_handler as base

import requests
import db_op
from log import log
from datetime import datetime, timedelta
from itertools import islice
# requests param conflict
import json as JSON

# https://github.com/SchedulesDirect/JSON-Service/wiki/API-20141201

RESPONSE_CODE_OK = 0
RESPONSE_CODE_OFFLINE = 3000
API_BATCH_SIZE = 5000

# https://stackoverflow.com/a/61435714


def batches(it, size):
    iterator = iter(it)
    chunks = []
    while chunk := list(islice(iterator, size)):
        chunks.append(chunk)
    return chunks


class SchedulesDirect(base.BaseHandler):
    def __init__(self):
        self.api_url = "https://json.schedulesdirect.org/20141201"
        self.headers = {
            'User-Agent': 'Snowstream 1.0.0'
        }

    def download(self, stream_source):
        if stream_source.remote_data:
            log.info("Using cached data from SchedulesDirect")
            return stream_source
        token_payload = {'username': stream_source.username, 'password': stream_source.password}
        token_response = requests.post(self.api_url+"/token", headers=self.headers, json=token_payload).json()
        if token_response['code'] == RESPONSE_CODE_OFFLINE:
            log.error("SchedulesDirect reports that it is offline. Try again in an hour.")
            return False
        self.headers['token'] = token_response['token']

        status_response = requests.get(self.api_url+"/status", headers=self.headers).json()
        lineups = status_response['lineups']

        # For now, let's assume a simple account setup with a single lineup.
        # This may grow to support multiple lineups in the future.
        if len(lineups) == 0:
            log.info(f"Schedules Direct found no lineups for account [{stream_source.username}]")
            return False
        lineup = lineups[0]
        lineup_response = requests.get(self.api_url+'/lineups/'+lineup['lineup'], headers=self.headers).json()

        station_ids = [x['stationID'] for x in lineup_response['map']]
        schedule_dates = [
            datetime.now().strftime('%Y-%m-%d'),
            (datetime.now() + timedelta(1)).strftime('%Y-%m-%d'),
            (datetime.now() + timedelta(2)).strftime('%Y-%m-%d')
        ]
        schedules_response = []
        for station_id_batch in batches(station_ids, API_BATCH_SIZE):
            schedules_payload = []
            for station_id in station_id_batch:
                schedules_payload.append({
                    'stationID': station_id,
                    'date': schedule_dates
                })
            api_response = requests.post(self.api_url+"/schedules", headers=self.headers, json=schedules_payload).json()
            schedules_response = schedules_response + api_response

        program_ids = []
        for station in schedules_response:
            program_ids = program_ids + [x['programID'] for x in station['programs']]
        programs_response = []
        for program_id_batch in batches(program_ids, API_BATCH_SIZE):
            api_response = requests.post(self.api_url+'/programs', headers=self.headers, json=program_id_batch).json()
            programs_response = programs_response + api_response
        results = {
            'status': status_response,
            'linup': lineup_response,
            'schedules': schedules_response,
            'programs': programs_response
        }
        return db_op.update_stream_source(id=stream_source.id, remote_data=JSON.dumps(results))

    def parse_guide_info(self, stream_source):
        remote_data = JSON.loads(stream_source.remote_data)
        # TODO Import EPG data that was cached from SchedulesDirect
        return True
