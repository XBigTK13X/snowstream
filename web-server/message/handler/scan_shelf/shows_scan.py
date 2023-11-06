from log import log
import message.handler.scan_shelf.base_handler as base
import ingest as db_ingest
from pathlib import Path
import re

SHOW_REGEX = re.compile(
    r"(?P<show_name>[^\/]*?)\/(Season (?P<season_index>\d{1,6})|Specials|Extras)\/S(?P<season_start>\d{0,5})E(?P<episode_start>\d{1,6})(-S(?P<season_end>\d{1,6})E(?P<episode_end>\d{0,5}))*", re.IGNORECASE)


def parse_show_info(file_path: str):
    location = Path(file_path).as_posix()
    matches = re.search(SHOW_REGEX, location)
    if matches == None:
        return None
    match_lookup = matches.groupdict()
    result = {}
    result['show_name'] = matches.group('show_name')
    result['season'] = 0 if match_lookup['season_index'] == None else int(matches.group('season_index'))
    result['season_start'] = int(matches.group('season_start'))
    result['episode_start'] = int(matches.group('episode_start'))
    result['season_end'] = None if match_lookup['season_end'] == None else int(matches.group('season_end'))
    result['episode_end'] = None if match_lookup['episode_end'] == None else int(matches.group('episode_end'))
    return result

def identify_show_kind(info:dict):
    return 'show_extra' if info['season'] == 0 else 'show_episode'

class ShowsScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest(self, kind:str):
        return self.ingest_files(kind=kind, parser=parse_show_info, identifier=identify_show_kind)

    def ingest_videos(self):
        parsed_videos = self.ingest(kind='video')
        for info in parsed_videos:
            dbm = db_ingest.video(shelf_id=self.shelf.id,kind=info['kind'], file_path=info['file_path'])
            info['id'] = dbm.id
        self.file_info_lookup['video'] = parsed_videos
        return True

    def ingest_images(self):
        parsed_images = self.ingest(kind='image')
        return True

    def ingest_metadata(self):
        parsed_metadata = self.ingest(kind='metadata')
        return True

    def organize(self):
        pass
