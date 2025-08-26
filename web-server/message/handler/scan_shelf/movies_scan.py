import re
import os
from log import log
from pathlib import Path
from db import db
from message.handler.scan_shelf.shelf_scanner import ShelfScanner
import snow_media.nfo

MOVIE_ASSETS_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)"
    r"\s\((?P<movie_folder_year>\d{4,5})\)\/"
    r"(?P<asset_name>[^\.].*)",
    re.IGNORECASE
)
MOVIE_EXTRAS_ASSETS_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)"
    r"\s\((?P<movie_folder_year>\d{4,5})\)\/"
    r"(?P<subdirectory>Extras)\/"
    r"(?P<asset_name>[^\.].*)",
    re.IGNORECASE
)

MOVIE_VIDEO_FILE_REGEX = re.compile(
    r"(?P<directory>.*?)"
    r"(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/"
    r"(?P<movie_file_name>.*?)\s\((?P<movie_file_year>\d{4,5})\)"
    r"(\s-\s(?P<version>\[.*\]))?(\s(?P<quality>[^\.]*))?.(?P<format>[a-zA-Z0-9]*)",
    re.IGNORECASE
)
MOVIE_EXTRAS_VIDEO_FILE_REGEX = re.compile(
    r"(?P<directory>.*?)"
    r"(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/"
    r"(?P<subdirectory>Extras)\/(?P<extra_name>.*)\..*",
    re.IGNORECASE
)


def parse_movie_assets_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("movie_folder_name") + f" ({matches.group('movie_folder_year')})/")
    ).as_posix()
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_movie_extras_assets_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("movie_folder_name") + f" ({matches.group('movie_folder_year')})/")
    ).as_posix()
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_movie_video_file_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("movie_folder_name") + f" ({matches.group('movie_folder_year')})/")
    ).as_posix()
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["movie_quality"] = matches.group("quality")
    return result


def parse_movie_extras_video_file_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("movie_folder_name") + f" ({matches.group('movie_folder_year')})/")
    ).as_posix()
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["extra_name"] = matches.group("extra_name")
    return result

def is_image(file_path):
    ff = file_path.lower()
    return '.jpg' in ff or '.png' in ff or '.bmp' in ff or '.jpeg' in ff

def parse_movie_info(file_path):
    location = Path(file_path).as_posix()
    matches = re.search(MOVIE_EXTRAS_VIDEO_FILE_REGEX, location)
    if matches != None and not is_image(file_path):
        return parse_movie_extras_video_file_info(matches=matches)
    matches = re.search(MOVIE_VIDEO_FILE_REGEX, location)
    if matches != None and not is_image(file_path):
        return parse_movie_video_file_info(matches=matches)
    matches = re.search(MOVIE_EXTRAS_ASSETS_REGEX, location)
    if matches != None:
        return parse_movie_extras_assets_info(matches=matches)
    matches = re.search(MOVIE_ASSETS_REGEX, location)
    if matches != None:
        return parse_movie_assets_info(matches=matches)
    return None


def identify_movie_file_kind(extension_kind: str, info: dict, file_path: str):
    if extension_kind == "metadata":
        return (
            "movie_main_feature_info"
            if not "extra_name" in info
            else "movie_extra_info"
        )
    if extension_kind == "image":
        image_kind = "unknown"
        if "poster" in info["asset_name"] or "folder" in info["asset_name"]:
            image_kind = "poster"
        elif "banner" in info["asset_name"]:
            image_kind = "banner"
        elif "backdrop" in info["asset_name"]:
            image_kind = "backdrop"
        elif "logo" in info["asset_name"]:
            image_kind = "logo"
        movie_kind = "movie_main_feature" if not "extra_name" in info else "movie_extra"
        return f"{movie_kind}_{image_kind}"
    if extension_kind == "video":
        return "movie_main_feature" if not "extra_name" in info else "movie_extra"
    return None


class MoviesScanHandler(ShelfScanner):
    def __init__(self, scope, shelf, target_directory=None):
        super().__init__(
            scope=scope,
            shelf=shelf,
            identifier=identify_movie_file_kind,
            parser=parse_movie_info,
            target_directory=target_directory
        )

    def get_or_create_movie(self, info):
        movie_slug = f'{info["movie_name"]}-{info["movie_year"]}'
        if not movie_slug in self.batch_lookup:
            movie = db.op.get_movie_by_name_and_year(
                name=info["movie_name"], release_year=info["movie_year"]
            )
            if not movie:
                movie = db.op.create_movie(
                    name=info["movie_name"], release_year=info["movie_year"], directory=info['directory']
                )
                db.op.add_movie_to_shelf(shelf_id=self.shelf.id, movie_id=movie.id)
            self.batch_lookup[movie_slug] = movie
        movie = self.batch_lookup[movie_slug]
        if not movie.remote_metadata_id and self.scope.metadata_id:
            db.op.update_movie_remote_metadata_id(movie.id, remote_metadata_id=self.scope.metadata_id)
        return movie_slug, movie

    def organize_images(self):
        progress_count = 0
        for info in self.file_info_lookup["image"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize movie image {progress_count} out of {len(self.file_info_lookup["image"])}')
                movie_slug, movie = self.get_or_create_movie(info=info)
                if not db.op.get_movie_image_file(
                    movie_id=movie.id, image_file_id=info["id"]
                ):
                    db.op.create_movie_image_file(
                        movie_id=movie.id, image_file_id=info["id"]
                    )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing image [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")

    def organize_metadata(self):
        progress_count = 0
        for info in self.file_info_lookup["metadata"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize movie metadata {progress_count} out of {len(self.file_info_lookup["metadata"])}')
                movie_slug, movie = self.get_or_create_movie(info=info)
                if not db.op.get_movie_metadata_file(
                    movie_id=movie.id, metadata_file_id=info["id"]
                ):
                    db.op.create_movie_metadata_file(
                        movie_id=movie.id, metadata_file_id=info["id"]
                    )
                    movie_nfo = snow_media.nfo.nfo_path_to_dict(info['file_path'])
                    remote_id = None
                    remote_source = None
                    if 'tvdbid' in movie_nfo:
                        remote_id = int(movie_nfo['tvdbid'])
                        remote_source = 'thetvdb'
                    if 'tmdbid' in movie_nfo:
                        remote_id = int(movie_nfo['tmdbid'])
                        remote_source = 'themoviedb'
                    if remote_id:
                        movie = db.op.update_movie_remote_metadata_id(
                            movie_id=movie.id,
                            remote_metadata_id=remote_id,
                            remote_metadata_source=remote_source
                        )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing metadata [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")


    def organize_videos(self):
        progress_count = 0
        for info in self.file_info_lookup["video"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize movie video {progress_count} out of {len(self.file_info_lookup["video"])}')
                movie_slug, movie = self.get_or_create_movie(info=info)
                if not db.op.get_movie_video_file(
                    movie_id=movie.id, video_file_id=info["id"]
                ):
                    db.op.create_movie_video_file(
                        movie_id=movie.id, video_file_id=info["id"]
                    )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing video [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")
