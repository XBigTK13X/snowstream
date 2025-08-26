import re
import os
import snow_media.nfo
from enum import Flag, auto
from log import log
from pathlib import Path
from db import db
from message.handler.scan_shelf.shelf_scanner import ShelfScanner

class AssetScope(Flag):
    EPISODE = auto()
    SEASON = auto()
    SHOW = auto()
    HAS_SEASON = EPISODE | SEASON

SHOW_REGEX = re.compile(
    r"(?P<directory>.*)\/"
    r"(?P<show_name>[^\/]*)\/(?P<asset_name>.*)",
    re.IGNORECASE
)

SHOW_SEASON_REGEX = re.compile(
    r"(?P<directory>.*?)"
    r"(?P<show_name>[^\/]*?)\/"
    r"(Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/"
    r"(?P<asset_name>.*)",
    re.IGNORECASE,
)

SHOW_EPISODE_WITH_SEASON_DIR_REGEX = re.compile(
    r"(?P<directory>.*?)"
    r"(?P<show_name>[^\/]*?)\/"
    r"((Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/).?"
    r"(?P<metadata>metadata\/)?"
    r"([^\/]*?)(S(?P<season_start>\d{0,5}))?(E)?(?P<episode_start>\d{1,6})"
    r"((-(S(?P<season_end>\d{1,6}))?(E)?(?P<episode_end>\d{0,5}))?"
    r"( - (?P<title>.*)?)?)?"
    r"\s*\.(?P<format>[a-zA-Z0-9]{3,6})",
    re.IGNORECASE,
)

SHOW_EPISODE_REGEX = re.compile(
    r"(?P<directory>.*?)"
    r"(?P<show_name>[^\/]*?)\/"
    r"((Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/)?"
    r"(?P<metadata>metadata\/)?"
    r"([^\/]*?)(S(?P<season_start>\d{0,5}))?(E)?(?P<episode_start>\d{1,6})"
    r"((-(S(?P<season_end>\d{1,6}))?(E)?(?P<episode_end>\d{0,5}))?"
    r"( - (?P<title>.*)?)?)?"
    r"\s*\.(?P<format>[a-zA-Z0-9]{3,6})",
    re.IGNORECASE,
)


def parse_show_file_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("show_name") + "/")
    ).as_posix()
    result["asset_scope"] = AssetScope.SHOW
    result["show_name"] = matches.group("show_name")
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_season_file_info(matches):
    match_lookup = matches.groupdict()
    result = {}
    result["asset_scope"] = AssetScope.SEASON
    result["show_name"] = matches.group("show_name")
    raw_season = None
    if 'season_start' in match_lookup and match_lookup['season_start'] != None:
        raw_season = match_lookup['season_start']
    elif 'season_order_counter' in match_lookup:
        raw_season = match_lookup['season_order_counter']
        if raw_season == None:
            raw_season = 0
    result['season'] = int(raw_season)
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("show_name") + "/")
    ).as_posix()
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_episode_file_info(matches):
    match_lookup = matches.groupdict()
    result = {}
    result["show_name"] = matches.group("show_name")
    result["asset_scope"] = AssetScope.EPISODE
    raw_season = None
    if 'season_start' in match_lookup and match_lookup['season_start'] != None:
        raw_season = match_lookup['season_start']
    elif 'season_order_counter' in match_lookup:
        raw_season = match_lookup['season_order_counter']
        if raw_season == None:
            raw_season = 0
    result['season'] = int(raw_season)
    result["episode_start"] = int(matches.group("episode_start"))
    result["season_end"] = (
        None if match_lookup["season_end"] == None else int(matches.group("season_end"))
    )
    result["episode_end"] = (
        None
        if match_lookup["episode_end"] == None
        else int(matches.group("episode_end"))
    )
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("show_name") + "/")
    ).as_posix()
    result['title'] = matches.group('title')
    return result


def parse_show_info(file_path: str):
    location = Path(file_path).as_posix()
    matches = re.search(SHOW_EPISODE_WITH_SEASON_DIR_REGEX, location)
    if matches == None:
        matches = re.search(SHOW_EPISODE_REGEX,location)
    if matches != None:
        info = parse_episode_file_info(matches=matches)
        info['file_directory'] = os.path.dirname(file_path)
        return info

    matches = re.search(SHOW_SEASON_REGEX, location)
    if matches != None:
        info = parse_season_file_info(matches=matches)
        info['file_directory'] = os.path.dirname(file_path)
        return info

    matches = re.search(SHOW_REGEX, location)
    # Weird scanner issue that I don't see the problem with regex
    # if info['show_name'] == '[number]':
    #    return None
    if matches != None:
        return parse_show_file_info(matches=matches)

    return None


def identify_show_file_kind(extension_kind: str, info: dict, file_path: str):
    if extension_kind == "video":
        return "show_extra" if info["season"] == 0 else "show_episode"
    if extension_kind == "image":
        image_kind = None
        if 'asset_name' in info:
            if "poster" in info["asset_name"] or "folder" in info["asset_name"]:
                image_kind = "poster"
            if "banner" in info["asset_name"]:
                image_kind = "banner"
            if "backdrop" in info["asset_name"]:
                image_kind = "backdrop"
        if "episode_start" in info:
            if image_kind == None:
                image_kind = 'screencap'
            return f"episode_{image_kind}"
        if "season" in info:
            if image_kind == None:
                image_kind = 'poster'
            return f"season_{image_kind}"
        return f"show_{image_kind}"
    if extension_kind == "metadata":
        if "season" in info:
            return "season_info"
        if "episode_start" in info:
            return "episode_info"
        return "show_info"
    return None


class ShowsScanHandler(ShelfScanner):
    def __init__(self, scope, shelf, target_directory=None):
        super().__init__(
            scope=scope,
            shelf=shelf,
            identifier=identify_show_file_kind,
            parser=parse_show_info,
            target_directory=target_directory
        )

    def get_or_create_show(self, info):
        show_slug = f'{info["show_name"]}'
        if not show_slug in self.batch_lookup:
            show = db.op.get_show_by_name(name=info["show_name"])
            if not show:
                show = db.op.create_show(
                    name=info["show_name"], directory=info["directory"]
                )
                db.op.add_show_to_shelf(shelf_id=self.shelf.id, show_id=show.id)
            self.batch_lookup[show_slug] = {"show_id": show.id}
            if not show.remote_metadata_id and self.scope.metadata_id:
                db.op.update_show_remote_metadata_id(show_id=show.id, remote_metadata_id=self.scope.metadata_id)
        show_id = self.batch_lookup[show_slug]["show_id"]
        return show_slug, show_id

    def get_or_create_season(self, show_slug, show_id, info):
        season_slug = f'season-{info["season"]}'
        if not season_slug in self.batch_lookup[show_slug]:
            season = db.op.get_show_season_by_show_and_order(
                show_id=show_id, season_order_counter=info["season"]
            )
            if not season:
                season = db.op.create_show_season(
                    show_id=show_id, season_order_counter=info["season"], directory=info['file_directory']
                )
            self.batch_lookup[show_slug][season_slug] = season.id
        season_id = self.batch_lookup[show_slug][season_slug]
        return season_slug, season_id

    def get_or_create_episode(
        self,
        season_id:int,
        episode_order_counter:int,
        episode_end_order_counter:int=None,
        episode_title:str=None):
        episode = db.op.get_show_episode_by_season_order(
            show_season_id=season_id,
            episode_order_counter=episode_order_counter,
        )
        if not episode:
            episode = db.op.create_show_episode(
                show_season_id=season_id,
                episode_order_counter=episode_order_counter,
                episode_end_order_counter=episode_end_order_counter,
                name=episode_title
            )
        return episode

    def get_episode_from_info(self,season_id:int,info:dict):
        episode_end = None
        if 'episode_end' in info and info['episode_end']:
            episode_end = info['episode_end']
        return self.get_or_create_episode(
            season_id=season_id,
            episode_order_counter=info['episode_start'],
            episode_end_order_counter=episode_end,
            episode_title=info['title']
        )

    def organize_metadata(self):
        progress_count = 0
        for info in self.file_info_lookup["metadata"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize show metadata {progress_count} out of {len(self.file_info_lookup["metadata"])}')
                show_slug, show_id = self.get_or_create_show(info=info)
                season_slug = None
                season_id = None
                show_nfo = None
                if info["asset_scope"] in AssetScope.HAS_SEASON:
                    season_slug, season_id = self.get_or_create_season(
                        show_slug=show_slug, show_id=show_id, info=info
                    )

                if info["asset_scope"] == AssetScope.SHOW:
                    if not db.op.get_show_metadata_file(
                        show_id=show_id, metadata_file_id=info["id"]
                    ):
                        db.op.create_show_metadata_file(
                            show_id=show_id, metadata_file_id=info["id"]
                        )
                        show_nfo = snow_media.nfo.nfo_path_to_dict(info['file_path'])
                        if 'year' in show_nfo:
                            db.op.update_show_release_year(
                                show_id=show_id,
                                release_year=int(show_nfo['year'])
                            )
                        remote_id = None
                        remote_source = None
                        if 'tmdbid' in show_nfo:
                            remote_id = int(show_nfo['tmdbid'])
                            remote_source = 'themoviedb'
                        if 'tvdbid' in show_nfo:
                            remote_id = int(show_nfo['tvdbid'])
                            remote_source = 'thetvdb'
                        if remote_id != None:
                            db.op.update_show_remote_metadata_id(
                                show_id=show_id,
                                remote_metadata_id=remote_id,
                                remote_metadata_source=remote_source
                            )
                elif info["asset_scope"] == AssetScope.SEASON:
                    if not db.op.get_show_season_metadata_file(
                        show_season_id=season_id, metadata_file_id=info["id"]
                    ):
                        db.op.create_show_season_metadata_file(
                            show_season_id=season_id, metadata_file_id=info["id"]
                        )
                else:
                    episode = self.get_episode_from_info(season_id=season_id,info=info)
                    if not db.op.get_show_episode_metadata_file(
                        show_episode_id=episode.id, metadata_file_id=info["id"]
                    ):
                        db.op.create_show_episode_metadata_file(
                            show_episode_id=episode.id, metadata_file_id=info["id"]
                        )
                        metadata = snow_media.nfo.nfo_path_to_dict(nfo_path=info['file_path'])
                        if 'title' in metadata:
                            db.op.update_show_episode_name(
                                show_episode_id=episode.id,
                                name=metadata['title']
                            )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing metadata [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")

    def organize_images(self):
        progress_count = 0
        for info in self.file_info_lookup["image"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize show image {progress_count} out of {len(self.file_info_lookup["image"])}')
                show_slug, show_id = self.get_or_create_show(info=info)
                season_slug = None
                season_id = None
                if info["asset_scope"] in AssetScope.HAS_SEASON:
                    season_slug, season_id = self.get_or_create_season(
                        show_slug=show_slug, show_id=show_id, info=info
                    )
                if info["asset_scope"] == AssetScope.SHOW:
                    if not db.op.get_show_image_file(
                        show_id=show_id, image_file_id=info["id"]
                    ):
                        db.op.create_show_image_file(
                            show_id=show_id, image_file_id=info["id"]
                        )
                elif info["asset_scope"] == AssetScope.SEASON:
                    if not db.op.get_show_season_image_file(
                        show_season_id=season_id, image_file_id=info["id"]
                    ):
                        db.op.create_show_season_image_file(
                            show_season_id=season_id, image_file_id=info["id"]
                        )
                else:
                    episode = self.get_episode_from_info(season_id=season_id,info=info)
                    image_file_association = db.op.get_show_episode_image_file(
                        show_episode_id=episode.id, image_file_id=info["id"]
                    )
                    if not image_file_association:
                        db.op.create_show_episode_image_file(
                            show_episode_id=episode.id, image_file_id=info["id"]
                        )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing image [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")

    def organize_videos(self):
        progress_count = 0
        for info in self.file_info_lookup["video"]:
            try:
                progress_count += 1
                if progress_count % 500 == 0:
                    db.op.update_job(job_id=self.scope.job_id, message=f'Organize show video {progress_count} out of {len(self.file_info_lookup["video"])}')
                show_slug, show_id = self.get_or_create_show(info=info)
                season_slug, season_id = self.get_or_create_season(
                    show_slug=show_slug, show_id=show_id, info=info
                )
                episode = self.get_episode_from_info(season_id=season_id,info=info)
                video_file_association = db.op.get_show_episode_video_file(
                    show_episode_id=episode.id, video_file_id=info["id"]
                )
                if not video_file_association:
                    db.op.create_show_episode_video_file(
                        show_episode_id=episode.id, video_file_id=info["id"]
                    )
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing video [{info['file_path']}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")
