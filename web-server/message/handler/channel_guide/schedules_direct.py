from message.handler.channel_guide.guide_source_importer import GuideSourceImporter

from db import db
import requests
from log import log
from datetime import datetime, timedelta, timezone
from itertools import islice
import util

# requests param conflict
import json as JSON

# https://github.com/SchedulesDirect/JSON-Service/wiki/API-20141201

RESPONSE_CODE_OK = 0
RESPONSE_CODE_OFFLINE = 3000
API_BATCH_SIZE = 5000

# https://stackoverflow.com/a/61435714

# Example datetime 2015-03-03T00:00:00Z
SD_DATE_TIME_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


def batches(it, size):
    iterator = iter(it)
    chunks = []
    while chunk := list(islice(iterator, size)):
        chunks.append(chunk)
    return chunks


class SchedulesDirect(GuideSourceImporter):
    def __init__(self, job_id, guide_source):
        super().__init__(job_id, "Schedules Direct", guide_source)
        self.api_url = "https://json.schedulesdirect.org/20141201"
        self.headers = {"User-Agent": "Snowstream 1.0.0"}

    def download(self):
        if super().download():
            return True

        hashword = util.string_to_sha1(self.guide_source.password)

        if not self.guide_source.url:
            db.op.update_job(job_id=self.job_id, message="No url set for schdules direct. Set it to `country=<>&postalcod=<>`")
            return False

        token_payload = {
            "username": self.guide_source.username,
            "password": hashword,
        }
        token_response = requests.post(
            self.api_url + "/token", headers=self.headers, json=token_payload
        ).json()
        if token_response["code"] == RESPONSE_CODE_OFFLINE:
            db.op.update_job(job_id=self.job_id, message="Schedules Direct reports that it is offline. Try again in an hour.")
            return False
        self.headers["token"] = token_response["token"]

        if 'country=' in self.guide_source.url and 'postalcode=' in self.guide_source.url:
            headends_response = requests.get(
                self.api_url + "/headends?" + self.guide_source.url,
                headers=self.headers
            ).json()
            db.op.update_job(job_id=self.job_id, message=JSON.dumps(headends_response,indent=4))
            return False

        lineup_code = self.guide_source.url
        requests.put(
            self.api_url + '/lineups/' + lineup_code,
            headers=self.headers
        ).json()
        lineup_response = requests.get(
            self.api_url + "/lineups/" + lineup_code,
            headers=self.headers
        ).json()

        station_ids = [x["stationID"] for x in lineup_response["map"]]
        schedule_dates = [
            datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            (datetime.now(timezone.utc) + timedelta(1)).strftime("%Y-%m-%d"),
            (datetime.now(timezone.utc) + timedelta(2)).strftime("%Y-%m-%d"),
        ]
        schedules_response = []
        for station_id_batch in batches(station_ids, API_BATCH_SIZE):
            schedules_payload = []
            for station_id in station_id_batch:
                schedules_payload.append(
                    {"stationID": station_id, "date": schedule_dates}
                )
            api_response = requests.post(
                self.api_url + "/schedules",
                headers=self.headers,
                json=schedules_payload,
            ).json()
            schedules_response = schedules_response + api_response

        program_ids = []
        for schedule in schedules_response:
            program_ids = program_ids + [x["programID"] for x in schedule["programs"]]
        programs_response = []
        for program_id_batch in batches(program_ids, API_BATCH_SIZE):
            api_response = requests.post(
                self.api_url + "/programs", headers=self.headers, json=program_id_batch
            ).json()
            programs_response = programs_response + api_response
        results = {
            "lineup": lineup_response,
            "schedules": schedules_response,
            "programs": programs_response,
        }
        self.cached_data = db.op.upsert_cached_text(
            key=self.cache_key, data=JSON.dumps(results)
        )
        return True

    def parse_guide_info(self):
        remote_data = JSON.loads(self.cached_data)
        channel_lookup = {}
        program_lookup = {}
        for station in remote_data["lineup"]["stations"]:
            channel_lookup[station["stationID"]] = {
                "affiliate": station['affiliate'],
                "callsign": station["name"],
                "programs": [],
                "station_id": station["stationID"],

            }
        for station in remote_data['lineup']['map']:
            channel_lookup[station['stationID']]['number'] = station['channel']

        for program in remote_data["programs"]:
            entry = {
                "program_id": program["programID"],
                "name": program["titles"][0]["title120"],
            }
            if "eventDetails" in program and "subType" in program["eventDetails"]:
                entry["kind"] = program["eventDetails"]["subType"]
            if "episodeTitle150" in program:
                entry["episode_name"] = program["episodeTitle150"]
            if "descriptions" in program:
                entry["description"] = (
                    program["descriptions"]["description1000"][0]["description"],
                )
            else:
                entry["description"] = None
            program_lookup[program["programID"]] = entry
        program_count = 0
        for schedule in remote_data["schedules"]:
            channel = channel_lookup[schedule["stationID"]]
            for program in schedule["programs"]:
                start_datetime = datetime.strptime(
                    program["airDateTime"], SD_DATE_TIME_FORMAT
                )
                end_datetime = start_datetime + timedelta(seconds=program["duration"])
                channel["programs"].append(
                    {
                        "start_datetime": start_datetime,
                        "stop_datetime": end_datetime,
                        "name": program_lookup[program["programID"]]["name"],
                        "description": program_lookup[program["programID"]][
                            "description"
                        ],
                    }
                )
                program_count += 1

        initial_count = len(channel_lookup.keys())
        db.op.update_job(job_id=self.job_id, message=f"About to import {initial_count} channels with {program_count} programs")
        prune_count = 0
        channel_count = 0
        for key, val in channel_lookup.items():
            if not "programs" in val or len(val["programs"]) == 0:
                prune_count += 1
            else:
                entry = channel_lookup[key]
                channel_count += 1
                channel_name = f'{entry["callsign"]} - {entry['number']} - {entry['affiliate']}'
                if channel_count % 25 == 0:
                    db.op.update_job(job_id=self.job_id, message=f"Ingesting channel {channel_count} out of {initial_count}")
                channel = db.op.get_channel_by_parsed_id(channel_name)
                if not channel:
                    channel = db.op.create_channel({
                        "channel_guide_source_id":self.guide_source.id,
                        "parsed_id": channel_name,
                        "parsed_name": entry['callsign'],
                        "parsed_number": entry['number']
                    })
                for program in val["programs"]:
                    program["channel_id"] = channel.id
                db.op.create_channel_programs(val['programs'])

        db.op.update_job(job_id=self.job_id, message=f"Found programs for {initial_count-prune_count} out of {initial_count} channels.")

        return True
