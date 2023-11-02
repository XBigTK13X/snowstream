from log import log
import message.handler.scan_shelf.base_handler as base
import ingest
from pathlib import Path
import re

MOVIE_REGEX = r"(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<movie_file_name>.*?)\s\((?P<movie_file_year>\d{4,5})\)\s(?P<quality>.*)?\..*"
MOVIE_EXTRAS_REGEX = r"(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<subdirectory>Extras)\/(?P<extra_name>.*)\..*"


def parse_movie_info(file_path):
    location = Path(file_path).as_posix()
    if 'Extras' in location:
        matches = re.search(MOVIE_REGEX, location)
        match_lookup = matches.groupdict()
        movie_name = matches.group('movie_file_name')
        movie_year = matches.group('movie_file_year')
        movie_quality = matches.group('quality')
    else:
        matches = re.search(MOVIE_EXTRAS_REGEX, location)
        match_lookup = matches.groupdict()
        movie_name = matches.group('movie_folder_name')
        movie_year = matches.group('movie_folder_year')
        extra_name = matches.group('extra_name')


class MoviesScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest_videos(self):
        for video_path in self.file_lookup['video']:
            log.info(f"Found a movie video [{video_path}]")
            ingest.video(file_path=video_path)
        return True

    def ingest_images(self):
        for image_path in self.file_lookup['image']:
            log.info(f"Found a movie image [{image_path}]")
            ingest.image(file_path=image_path)
        return True

    def ingest_metadata(self):
        for metadata_path in self.file_lookup['metadata']:
            log.info(f"Found some movie metadata [{metadata_path}]")
            ingest.metadata(file_path=metadata_path)
        return True
