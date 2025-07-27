import os
from log import log
import mimetypes
mimetypes.init()
from typing import Callable
from settings import config
from db import db

def get_file_kind(file_path):
    if file_path.endswith(".nfo"):
        return "metadata"

    if file_path.endswith(".srt") or file_path.endswith(".ass") or file_path.endswith(".ssa"):
        return "subtitle"

    mime = mimetypes.guess_type(file_path)[0]

    if mime != None:
        mime = mime.split("/")[0]

        if "video" in mime:
            return "video"
        if "image" in mime:
            return "image"

    return "unhandled"


class ShelfScanner:
    def __init__(
        self,
        scope,
        shelf,
        identifier: Callable[[dict], str],
        parser: Callable[[str], dict],
        target_directory: str=None
    ):
        self.scope = scope
        self.shelf = shelf
        self.file_lookup = {"video": [], "image": [], "metadata": [], "subtitle": [], "unhandled": []}
        self.file_info_lookup = {
            "video": [],
            "image": [],
            "metadata": [],
            "subtitle": []
        }
        self.batch_lookup = {}
        self.file_kind_identifier = identifier
        self.file_info_parser = parser
        self.target_directory = target_directory

    def get_files_in_directory(self):
        scan_directory = self.shelf.local_path if self.target_directory == None else self.target_directory
        db.op.update_job(job_id=self.scope.job_id, message=f"Scanning directory [{scan_directory}]")
        file_count = 0
        for root, dirs, files in os.walk(scan_directory, followlinks=True):
            for shelf_file in files:
                file_path = os.path.join(root, shelf_file)
                file_count += 1
                self.file_lookup[get_file_kind(file_path)].append(file_path)
        db.op.update_job(job_id=self.scope.job_id, message=f"Found [{file_count}] files to process")
        return True

    def ingest_files(self, kind: str):
        parsed_files = []
        for media_path in self.file_lookup[kind]:
            try:
                media_info = self.file_info_parser(file_path=media_path)
                if media_info == None:
                    db.op.update_job(job_id=self.scope.job_id, message=f"Wasn't able to parse {kind} info for [{media_path}]")
                    continue
                media_info["kind"] = self.file_kind_identifier(
                    extension_kind=kind, info=media_info, file_path=media_path
                )
                media_info["file_path"] = media_path
                parsed_files.append(media_info)
            except Exception as e:
                db.op.update_job(job_id=self.scope.job_id,message=f"An error occurred while processing {kind} [{media_path}]")
                import traceback
                db.op.update_job(job_id=self.scope.job_id,message=f"{traceback.format_exc()}")
        db.op.update_job(job_id=self.scope.job_id, message=
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
        progress_count = 0
        for info in items:
            progress_count += 1
            if progress_count % 500 == 0:
                db.op.update_job(job_id=self.scope.job_id, message=f'Ingesting item {progress_count} out of {len(items)}')
            local_path = info['file_path']
            creator = None
            if kind == 'video':
                creator = db.op.get_or_create_video_file
            if kind == 'image':
                creator = db.op.get_or_create_image_file
            if kind == 'metadata':
                creator = db.op.get_or_create_metadata_file
            dbm = creator(
                shelf_id=self.shelf.id,
                kind=info["kind"],
                local_path=local_path
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

    def get_files_lookup(self):
        return self.file_lookup
