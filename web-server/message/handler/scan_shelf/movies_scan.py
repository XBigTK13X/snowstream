from log import log
import message.handler.scan_shelf.base_handler as base
import ingest as db_ingest
from pathlib import Path
import re
from db import db

MOVIE_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<movie_file_name>.*?)\s\((?P<movie_file_year>\d{4,5})\)\s(?P<quality>.*)?\..*", re.IGNORECASE)
MOVIE_EXTRAS_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<subdirectory>Extras)\/(?P<extra_name>.*)\..*", re.IGNORECASE)


def parse_movie_info(file_path):
    location = Path(file_path).as_posix()
    result = {}
    if '/Extras/' in location:
        matches = re.search(MOVIE_EXTRAS_REGEX, location)
        if matches == None:
            return None
        result['movie_name'] = matches.group('movie_folder_name')
        result['movie_year'] = matches.group('movie_folder_year')
        result['extra_name'] = matches.group('extra_name')
        return result
    matches = re.search(MOVIE_REGEX, location)
    if matches == None:
        return None
    result['movie_name'] = matches.group('movie_file_name')
    result['movie_year'] = matches.group('movie_file_year')
    result['movie_quality'] = matches.group('quality')
    return result

def identify_movie_kind(info:dict):
    return "movie_main_feature" if not 'extra_name' in info else "movie_extra"

class MoviesScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(job_id=job_id, shelf=shelf)

    def ingest(self, kind:str):
        return self.ingest_files(kind=kind, parser=parse_movie_info, identifier=identify_movie_kind)

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
        for info in self.file_info_lookup['video']:
            movie_slug = f'{info["movie_name"]}-{info["movie_year"]}'
            if not movie_slug in self.batch_lookup:
                movie = db.op.get_movie(name=info['movie_name'], release_year=info['movie_year'])
                if not movie:
                    movie = db.op.create_movie(name=info['movie_name'], release_year=info['movie_year'])
                    db.op.add_movie_to_shelf(shelf_id=self.shelf.id,movie_id=movie.id)
                self.batch_lookup[movie_slug] = movie
            movie = self.batch_lookup[movie_slug]
            log.info(f"Matched [{movie.name}] to [{info['file_path']}]")
            if not db.op.get_movie_video_file(movie_id=movie.id, video_file_id=info['id']):
                db.op.create_movie_video_file(movie_id=movie.id,video_file_id=info['id'])