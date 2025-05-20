from log import log
import message.handler.scan_shelf.base_handler as base
from pathlib import Path
import re
from db import db
import os

from enum import Flag, auto


class AssetScope(Flag):
    EPISODE = auto()
    SEASON = auto()
    SHOW = auto()
    HAS_SEASON = EPISODE | SEASON


SHOW_REGEX = re.compile(
    r"(?P<directory>.*)\/(?P<show_name>[^\/]*)\/(?P<asset_name>.*)", re.IGNORECASE
)

SHOW_SEASON_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<show_name>[^\/]*?)\/(Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/(?P<asset_name>.*)",
    re.IGNORECASE,
)

SHOW_EPISODE_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<show_name>[^\/]*?)\/(Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/(?P<metadata>metadata\/)?S(?P<season_start>\d{0,5})E(?P<episode_start>\d{1,6})(-S(?P<season_end>\d{1,6})E(?P<episode_end>\d{0,5}))*",
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
    result["season"] = (
        0
        if match_lookup["season_order_counter"] == None
        else int(matches.group("season_order_counter"))
    )
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
    result["season"] = (
        0
        if match_lookup["season_order_counter"] == None
        else int(matches.group("season_order_counter"))
    )
    result["season_start"] = int(matches.group("season_start"))
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
    return result


def parse_show_info(file_path: str):
    location = Path(file_path).as_posix()
    matches = re.search(SHOW_EPISODE_REGEX, location)
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
                image_kind = 'thumbnail'
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


class ShowsScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(
            job_id=job_id,
            shelf=shelf,
            identifier=identify_show_file_kind,
            parser=parse_show_info,
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
            self.batch_lookup[show_slug] = {"show": show}
        show = self.batch_lookup[show_slug]["show"]
        return show_slug, show

    def get_or_create_season(self, show_slug, show, info):
        season_slug = f'season-{info["season"]}'
        if not season_slug in self.batch_lookup[show_slug]:
            season = db.op.get_show_season_by_show_and_order(
                show_id=show.id, season_order_counter=info["season"]
            )
            if not season:
                season = db.op.create_show_season(
                    show_id=show.id, season_order_counter=info["season"], directory=info['file_directory']
                )
            self.batch_lookup[show_slug][season_slug] = season
        season = self.batch_lookup[show_slug][season_slug]
        return season_slug, season

    def get_or_create_episode(self, season, episode_order_counter):
        episode = db.op.get_show_episode_by_season_order(
            show_season_id=season.id,
            episode_order_counter=episode_order_counter,
        )
        if not episode:
            episode = db.op.create_show_episode(
                show_season_id=season.id,
                episode_order_counter=episode_order_counter,
            )
        return episode

    def organize_metadata(self):
        progress_count = 0
        for info in self.file_info_lookup["metadata"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize show metadata {progress_count} out of {len(self.file_info_lookup["metadata"])}')
            show_slug, show = self.get_or_create_show(info=info)
            season_slug = None
            season = None
            if info["asset_scope"] in AssetScope.HAS_SEASON:
                season_slug, season = self.get_or_create_season(
                    show_slug=show_slug, show=show, info=info
                )

            if info["asset_scope"] == AssetScope.SHOW:
                if not db.op.get_show_metadata_file(
                    show_id=show.id, metadata_file_id=info["id"]
                ):
                    db.op.create_show_metadata_file(
                        show_id=show.id, metadata_file_id=info["id"]
                    )
            elif info["asset_scope"] == AssetScope.SEASON:
                if not db.op.get_show_season_metadata_file(
                    show_season_id=season.id, metadata_file_id=info["id"]
                ):
                    db.op.create_show_season_metadata_file(
                        show_season_id=season.id, metadata_file_id=info["id"]
                    )
            else:
                episode_end = (
                    info["episode_start"] + 1
                    if info["episode_end"] == None
                    else info["episode_end"]
                )
                for episode_order_counter in range(info["episode_start"], episode_end):
                    episode = self.get_or_create_episode(
                        season=season, episode_order_counter=episode_order_counter
                    )
                    if not db.op.get_show_episode_metadata_file(
                        show_episode_id=episode.id, metadata_file_id=info["id"]
                    ):
                        db.op.create_show_episode_metadata_file(
                            show_episode_id=episode.id, metadata_file_id=info["id"]
                        )

    def organize_images(self):
        progress_count = 0
        for info in self.file_info_lookup["image"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize show image {progress_count} out of {len(self.file_info_lookup["image"])}')
            show_slug, show = self.get_or_create_show(info=info)
            season_slug = None
            season = None
            if info["asset_scope"] in AssetScope.HAS_SEASON:
                season_slug, season = self.get_or_create_season(
                    show_slug=show_slug, show=show, info=info
                )
            if info["asset_scope"] == AssetScope.SHOW:
                if not db.op.get_show_image_file(
                    show_id=show.id, image_file_id=info["id"]
                ):
                    db.op.create_show_image_file(
                        show_id=show.id, image_file_id=info["id"]
                    )
            elif info["asset_scope"] == AssetScope.SEASON:
                if not db.op.get_show_season_image_file(
                    show_season_id=season.id, image_file_id=info["id"]
                ):
                    db.op.create_show_season_image_file(
                        show_season_id=season.id, image_file_id=info["id"]
                    )
            else:
                episode_end = (
                    info["episode_start"] + 1
                    if info["episode_end"] == None
                    else info["episode_end"]
                )
                for episode_order_counter in range(info["episode_start"], episode_end):
                    episode = self.get_or_create_episode(
                        season=season, episode_order_counter=episode_order_counter
                    )
                    image_file_association = db.op.get_show_episode_image_file(
                        show_episode_id=episode.id, image_file_id=info["id"]
                    )
                    if not image_file_association:
                        db.op.create_show_episode_image_file(
                            show_episode_id=episode.id, image_file_id=info["id"]
                        )

    def organize_videos(self):
        progress_count = 0
        for info in self.file_info_lookup["video"]:
            progress_count += 1
            if progress_count % 500 == 0:
                log.info(f'Organize show video {progress_count} out of {len(self.file_info_lookup["video"])}')
            show_slug, show = self.get_or_create_show(info=info)
            season_slug, season = self.get_or_create_season(
                show_slug=show_slug, show=show, info=info
            )
            episode_end = (
                info["episode_start"] + 1
                if info["episode_end"] == None
                else info["episode_end"]
            )
            for episode_order_counter in range(info["episode_start"], episode_end):
                episode = self.get_or_create_episode(
                    season=season, episode_order_counter=episode_order_counter
                )
                video_file_association = db.op.get_show_episode_video_file(
                    show_episode_id=episode.id, video_file_id=info["id"]
                )
                if not video_file_association:
                    db.op.create_show_episode_video_file(
                        show_episode_id=episode.id, video_file_id=info["id"]
                    )
