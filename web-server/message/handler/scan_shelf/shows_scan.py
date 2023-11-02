from log import log
import message.handler.scan_shelf.base_handler as base
import ingest
from pathlib import Path
import re

SHOW_REGEX = r"(?P<show_name>[^\/]*?)\/(Season (?P<season_index>\d{1,6})|Specials)\/S(?P<season_start>\d{0,5})E(?P<episode_start>\d{1,6})(-S(?P<season_end>\d{1,6})E(?P<episode_end>\d{0,5}))*"


def parse_show_info(file_path: str):
    location = Path(file_path).as_posix()
    matches = re.search(SHOW_REGEX, location)
    match_lookup = matches.groupdict()
    show_name = matches.group('show_name')
    season = 0 if not 'season_index' in match_lookup else int(matches.group('season_index'))
    season_start = int(matches.group('season_start'))
    episode_start = int(matches.group('episode_start'))
    season_end = None if not 'season_end_index' in match_lookup else int(matches.group('season_end_index'))
    episode_end = None if not 'episode_end_index' in match_lookup else int(matches.group('episode_end_index'))


class ShowsScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest_videos(self):
        for video_path in self.file_lookup['video']:
            log.info(f"Found a show video [{video_path}]")

            ingest.video(file_path=video_path)
        return True

    def ingest_images(self):
        for image_path in self.file_lookup['image']:
            log.info(f"Found a show image [{image_path}]")
            ingest.image(file_path=image_path)
        return True

    def ingest_metadata(self):
        for metadata_path in self.file_lookup['metadata']:
            log.info(f"Found some show metadata [{metadata_path}]")
            ingest.metadata(file_path=metadata_path)
        return True
