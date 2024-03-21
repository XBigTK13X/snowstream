from log import log
import message.handler.scan_shelf.base_handler as base
import ingest as db_ingest
from pathlib import Path
import re
from db import db
import os

SHOW_REGEX = re.compile(
    r"(?P<directory>.*)\/(?P<show_name>[^\/]*)\/(?P<asset_name>.*)", re.IGNORECASE
)

SHOW_SEASON_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<show_name>[^\/]*?)\/(Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/(?P<asset_name>.*)",
    re.IGNORECASE,
)

SHOW_EPISODE_REGEX = re.compile(
    r"(?P<directory>.*?)(?P<show_name>[^\/]*?)\/(Season (?P<season_order_counter>\d{1,6})|Specials|Extras)\/S(?P<season_start>\d{0,5})E(?P<episode_start>\d{1,6})(-S(?P<season_end>\d{1,6})E(?P<episode_end>\d{0,5}))*",
    re.IGNORECASE,
)


def parse_show_file_info(matches):
    result = {}
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("show_name") + "/")
    ).as_posix()
    result["show_name"] = matches.group("show_name")
    result["asset_name"] = matches.group("asset_name")
    return result


def parse_season_file_info(matches):
    match_lookup = matches.groupdict()
    result = {}
    result["show_name"] = matches.group("show_name")
    result["season"] = (
        0
        if match_lookup["season_order_counter"] == None
        else int(matches.group("season_order_counter"))
    )
    result["directory"] = Path(
        os.path.join(matches.group("directory"), matches.group("show_name") + "/")
    ).as_posix()
    result["asset_name"] = matches.group(["asset_name"])
    return result


def parse_episode_file_info(matches):
    match_lookup = matches.groupdict()
    result = {}
    result["show_name"] = matches.group("show_name")
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
        return parse_episode_file_info(matches=matches)

    matches = re.search(SHOW_SEASON_REGEX, location)
    if matches != None:
        return parse_season_file_info(matches=matches)

    matches = re.search(SHOW_REGEX, location)
    if matches != None:
        return parse_show_file_info(matches=matches)

    return None


def identify_show_kind(info: dict):
    if "asset_name" in info:
        if '.nfo' in info['asset_name']:
            if 'season' in info:
                return 'season_info'
            if 'episode_start' in info:
                return 'episode_info'
            return 'show_info'
        image_kind = 'poster'
        if 'banner' in info['asset_name']:
            image_kind = 'banner'
        if 'backdrop' in info['asset_name']:
            image_kind = 'backdrop'
        if 'season' in info:
            
        if "folder" in info["asset_name"] or "poster" in info["asset_name"]:
            return "show_poster"
        if ''
    return "show_extra" if info["season"] == 0 else "show_episode"


class ShowsScanHandler(base.BaseHandler):
    def __init__(self, job_id, shelf):
        super().__init__(
            job_id=job_id,
            shelf=shelf,
            identifier=identify_show_kind,
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
            season = db.op.get_show_season(
                show_id=show.id, season_order_counter=info["season"]
            )
            if not season:
                season = db.op.create_show_season(
                    show_id=show.id, season_order_counter=info["season"]
                )
            self.batch_lookup[show_slug][season_slug] = season
        season = self.batch_lookup[show_slug][season_slug]
        return season_slug, season

    def get_or_create_episode(self, season, episode_order_counter):
        episode = db.op.get_season_episode(
            show_season_id=season.id,
            episode_order_counter=episode_order_counter,
        )
        if not episode:
            episode = db.op.create_show_episode(
                show_season_id=season.id,
                episode_order_counter=episode_order_counter,
            )
        return episode

    def organize_images(self):
        for info in self.file_info_lookup["image"]:
            show_slug, show = self.get_or_create_show(info=info)
            season_slug, season = self.get_or_create_season(
                show_slug=show_slug, show=show, info=info
            )

    def organize_videos(self):
        for info in self.file_info_lookup["video"]:
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
                episode = self.get_or_create_episode(season=season, info=info)
                log.info(
                    f"Matched [{show.name} S{season.season_order_counter:02}E{episode.episode_order_counter:04}] to [{info['file_path']}]"
                )
                video_file_association = db.op.get_show_episode_video_file(
                    show_episode_id=episode.id, video_file_id=info["id"]
                )
                if not video_file_association:
                    db.op.create_show_episode_video_file(
                        show_episode_id=episode.id, video_file_id=info["id"]
                    )
