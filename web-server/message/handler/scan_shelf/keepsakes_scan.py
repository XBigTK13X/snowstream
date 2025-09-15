import uuid
import os
from log import log
from db import db
import json
from message.handler.scan_shelf.shelf_scanner import ShelfScanner
from snow_media import nfo,image
from settings import config


def parse_keepsake_info(file_path):
    return {
        'directory': os.path.dirname(file_path),
    }


def identify_keepsake_file_kind(extension_kind: str, info: dict, file_path: str):
    if extension_kind == "image":
        return "image"
    if extension_kind == "video":
        return "video"
    return None


class KeepsakesScanHandler(ShelfScanner):
    def __init__(self, scope, shelf, target_directory=None):
        super().__init__(
            scope=scope,
            shelf=shelf,
            identifier=identify_keepsake_file_kind,
            parser=parse_keepsake_info,
            target_directory=target_directory
        )

    def get_or_create_keepsake(self,info:dict):
        if not info['directory'] in self.batch_lookup:
            keepsake = db.op.get_keepsake_by_directory(directory=info['directory'])
            if not keepsake:
                keepsake = db.op.create_keepsake(directory=info['directory'])
                db.op.add_keepsake_to_shelf(shelf_id=self.shelf.id, keepsake_id=keepsake.id)
            self.batch_lookup[info['directory']] = keepsake
        return self.batch_lookup[info['directory']]

    def organize_images(self):
        progress_count = 0
        for info in self.file_info_lookup["image"]:
            progress_count += 1
            if progress_count % 500 == 0:
                db.op.update_job(job_id=self.scope.job_id, message=f'Organize keepsake image {progress_count} out of {len(self.file_info_lookup["image"])}')
            keepsake = self.get_or_create_keepsake(info=info)
            if not db.op.get_keepsake_image_file(
                keepsake_id=keepsake.id, image_file_id=info["id"]
            ):
                db.op.create_keepsake_image_file(
                    keepsake_id=keepsake.id, image_file_id=info["id"]
                )

    def organize_videos(self):
        progress_count = 0
        for info in self.file_info_lookup["video"]:
            progress_count += 1
            if progress_count % 500 == 0:
                db.op.update_job(job_id=self.scope.job_id, message=f'Organize keepsake video {progress_count} out of {len(self.file_info_lookup["video"])}')
            keepsake = self.get_or_create_keepsake(info=info)
            keepsake_video_file = db.op.get_keepsake_video_file(keepsake_id=keepsake.id, video_file_id=info["id"])
            if not keepsake_video_file:
                keepsake_video_file = db.op.create_keepsake_video_file(
                    keepsake_id=keepsake.id, video_file_id=info["id"]
                )
            video_file = db.op.get_video_file_by_id(video_file_id=info['id'])
            if not video_file.thumbnail_web_path:
                info = json.loads(video_file.snowstream_info_json)
                tmp_path = os.path.join('/tmp',str(uuid.uuid4())+'.jpg')
                image.extract_screencap(
                    video_path=video_file.local_path,
                    duration_seconds=info['duration_seconds'],
                    output_path=tmp_path
                )
                thumbnail_path = image.create_thumbnail(local_path=tmp_path)
                thumbnail_web_path = config.web_media_url + thumbnail_path
                if thumbnail_path[0] != '/':
                    thumbnail_web_path = config.web_media_url + '/' + thumbnail_path
                db.op.update_video_file_thumbnail(video_file_id=video_file.id,thumbnail_web_path=thumbnail_web_path)
