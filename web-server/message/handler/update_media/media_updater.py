import os
from db import db
from log import log
from snow_media import nfo
from message.job_media_scope import JobMediaScope
import requests
import snow_media.image
from settings import config

class FileStub:
    def __init__(self):
        self.local_path = None
        self.id = None

class MediaUpdater:
    def __init__(self, job_id:int, kind:str, scope:JobMediaScope):
        self.scope = scope
        self.job_id = job_id
        self.kind = kind
        self.db = db
        self.nfo = nfo
        self.ticket = db.Ticket(ignore_watch_group=True)
        self.log = log
        self.config = config
        self.FileStub = FileStub
        self.metadata = None


    def download_image(self,image_url:str,local_path:str):
        if not image_url:
            return False
        download = requests.get(image_url)
        if download.status_code == 200:
            with open(local_path, 'wb') as write_handle:
                write_handle.write(download.content)
            snow_media.image.create_thumbnail(local_path=local_path,force_overwrite=True)
            db.op.update_job(job_id=self.job_id, message=f"Downloaded {image_url} to {local_path}")
            return True
        return False

    def get_image_path(self):
        pass

    def has_nfo(self):
        pass

    def has_images(self):
        pass

    def read_local_info(self):
        pass

    def read_remote_info(self):
        pass

    def merge_remote_into_local(self):
        pass

    def save_info_to_local(self):
        pass

    def has_images(self):
        pass

    def download_images(self):
        pass

    def schedule_subjobs(self):
        pass