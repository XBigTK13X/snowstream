from log import log
import message.handler.scan_shelf.base_handler as base
from pathlib import Path
import re
from db import db

MOVIE_ASSETS_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<asset_name>.*)",
    re.IGNORECASE,
)
MOVIE_EXTRAS_ASSETS_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<subdirectory>Extras)\/(?P<asset_name>.*)",
    re.IGNORECASE,
)

MOVIE_VIDEO_FILE_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<movie_file_name>.*?)\s\((?P<movie_file_year>\d{4,5})\)\s(?P<quality>.*)?\..*",
    re.IGNORECASE,
)
MOVIE_EXTRAS_VIDEO_FILE_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<movie_folder_name>[^\/]*?)\s\((?P<movie_folder_year>\d{4,5})\)\/(?P<subdirectory>Extras)\/(?P<extra_name>.*)\..*",
    re.IGNORECASE,
)


def parse_movie_assets_info(matches):
    result = {}
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["asset_name"] = matches.group("asset_name")
    return result


# TODO This is wrong, check to see the extras asset format on disk
def parse_movie_extras_assets_info(matches):
    result = {}
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_movie_video_file_info(matches):
    result = {}
    result["movie_name"] = matches.group("movie_file_name")
    result["movie_year"] = matches.group("movie_file_year")
    result["movie_quality"] = matches.group("quality")
    return result


def parse_movie_extras_video_file_info(matches):
    result = {}
    result["movie_name"] = matches.group("movie_folder_name")
    result["movie_year"] = matches.group("movie_folder_year")
    result["extra_name"] = matches.group("extra_name")
    return result


# TODO get info from files without a quality/version designation
def parse_movie_info(file_path):
    location = Path(file_path).as_posix()
    matches = re.search(MOVIE_EXTRAS_VIDEO_FILE_REGEX, location)
    if matches != None:
        return parse_movie_extras_video_file_info(matches=matches)
    matches = re.search(MOVIE_VIDEO_FILE_REGEX, location)
    if matches != None:
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
        if "banner" in info["asset_name"]:
            image_kind = "banner"
        if "backdrop" in info["asset_name"]:
            image_kind = "backdrop"
        if "logo" in info["asset_name"]:
            image_kind = "logo"
        movie_kind = "movie_main_feature" if not "extra_name" in info else "movie_extra"
        return f"{movie_kind}_{image_kind}"
    if extension_kind == "video":
        return "movie_main_feature" if not "extra_name" in info else "movie_extra"
    return None


class MoviesScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(
            job_id=job_id,
            shelf=shelf,
            identifier=identify_movie_file_kind,
            parser=parse_movie_info,
        )

    def get_or_create_movie(self, info):
        movie_slug = f'{info["movie_name"]}-{info["movie_year"]}'
        if not movie_slug in self.batch_lookup:
            movie = db.op.get_movie_by_name_and_year(
                name=info["movie_name"], release_year=info["movie_year"]
            )
            if not movie:
                movie = db.op.create_movie(
                    name=info["movie_name"], release_year=info["movie_year"]
                )
                db.op.add_movie_to_shelf(shelf_id=self.shelf.id, movie_id=movie.id)
            self.batch_lookup[movie_slug] = movie
        movie = self.batch_lookup[movie_slug]
        return movie_slug, movie

    def organize_images(self):
        progress_count = 0
        for info in self.file_info_lookup["image"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize movie image {progress_count} out of {len(self.file_info_lookup["image"])}')
            movie_slug, movie = self.get_or_create_movie(info=info)
            if not db.op.get_movie_image_file(
                movie_id=movie.id, image_file_id=info["id"]
            ):
                db.op.create_movie_image_file(
                    movie_id=movie.id, image_file_id=info["id"]
                )

    def organize_metadata(self):
        progress_count = 0
        for info in self.file_info_lookup["metadata"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize movie metadata {progress_count} out of {len(self.file_info_lookup["metadata"])}')
            movie_slug, movie = self.get_or_create_movie(info=info)
            if not db.op.get_movie_metadata_file(
                movie_id=movie.id, metadata_file_id=info["id"]
            ):
                db.op.create_movie_metadata_file(
                    movie_id=movie.id, metadata_file_id=info["id"]
                )

    def organize_videos(self):
        progress_count = 0
        for info in self.file_info_lookup["video"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize movie video {progress_count} out of {len(self.file_info_lookup["video"])}')
            movie_slug, movie = self.get_or_create_movie(info=info)
            if not db.op.get_movie_video_file(
                movie_id=movie.id, video_file_id=info["id"]
            ):
                db.op.create_movie_video_file(
                    movie_id=movie.id, video_file_id=info["id"]
                )
