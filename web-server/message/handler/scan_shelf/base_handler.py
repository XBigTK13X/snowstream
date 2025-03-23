import os
from log import log
import mimetypes
mimetypes.init()
from typing import Callable
import ingest as db_ingest
from settings import config


def get_file_kind(file_path):
    if file_path.endswith(".nfo"):
        return "metadata"

    mime = mimetypes.guess_type(file_path)[0]

    if mime != None:
        mime = mime.split("/")[0]

        if "video" in mime:
            return "video"
        if "image" in mime:
            return "image"

    return "unhandled"


class BaseHandler:
    def __init__(
        self,
        job_id,
        shelf,
        identifier: Callable[[dict], str],
        parser: Callable[[str], dict],
    ):
        self.job_id = job_id
        self.shelf = shelf
        self.file_lookup = {"video": [], "image": [], "metadata": [], "unhandled": []}
        self.file_info_lookup = {
            "video": [],
            "image": [],
            "metadata": [],
        }
        self.batch_lookup = {}
        self.file_kind_identifier = identifier
        self.file_info_parser = parser

    def get_files_in_directory(self):
        log.info(f"Scanning directory [{self.shelf.local_path}]")
        file_count = 0
        for root, dirs, files in os.walk(self.shelf.local_path, followlinks=True):
            for shelf_file in files:
                file_path = os.path.join(root, shelf_file)
                file_count += 1
                self.file_lookup[get_file_kind(file_path)].append(file_path)
        log.info(f"Found [{file_count}] files to process")
        return True

    def ingest_files(self, kind: str):
        parsed_files = []
        for media_path in self.file_lookup[kind]:
            # log.info(f"Found a {kind} file [{media_path}]")
            media_info = self.file_info_parser(file_path=media_path)
            if media_info == None:
                log.info(f"Wasn't able to parse {kind} info for [{media_path}]")
                continue
            media_info["kind"] = self.file_kind_identifier(
                extension_kind=kind, info=media_info, file_path=media_path
            )
            media_info["file_path"] = media_path
            parsed_files.append(media_info)
        log.info(
            f"Ingested info for ({len(parsed_files)}/{len(self.file_lookup[kind])}) parsed {kind} file paths"
        )
        parsed_files = sorted(parsed_files, key=lambda x: x["file_path"])
        return parsed_files

    def organize_videos(self):
        return True

    def organize_images(self):
        return True

    def organize_metadata(self):
        return True

    def ingest_content(self, kind):
        items = self.ingest_files(kind=kind)
        for info in items:
            local_path = info['file_path']
            web_path = config.web_media_url + local_path
            network_path = ""
            if self.shelf.network_path:
                network_path = local_path.replace(self.shelf.local_path,self.shelf.network_path)
            ItemModel = getattr(db_ingest, kind)
            dbm = ItemModel(
                shelf_id=self.shelf.id,
                kind=info["kind"],
                local_path=local_path,
                web_path=web_path,
                network_path=network_path
            )
            info["id"] = dbm.id
        self.file_info_lookup[kind] = items
        return True

    def ingest_videos(self):
        return self.ingest_content("video")

    def ingest_images(self):
        return self.ingest_content("image")

    def ingest_metadata(self):
        return self.ingest_content("metadata")
