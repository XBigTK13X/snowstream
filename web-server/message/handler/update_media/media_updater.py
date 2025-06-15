import os
from db import db
from log import log
import nfo
from message.handler.update_media.provider.thetvdb_provider import ThetvdbProvider
from message.handler.update_media.provider.themoviedb_provider import ThemoviedbProvider
import requests
import magick
from settings import config

class FileStub:
    def __init__(self):
        self.local_path = None
        self.id = None

class MediaUpdater:
    def __init__(self, job_id, kind, scope):
        self.scope = scope
        self.job_id = job_id
        self.kind = kind
        self.db = db
        self.nfo = nfo
        self.ticket = db.model.Ticket()
        self.log = log
        self.config = config
        self.FileStub = FileStub
        self.metadata = None

    def has_images(self):
        return os.path.exists(self.get_image_path())

    def download_metadata(self):
        self.read_local_info()
        self.merge_remote_into_local()
        self.save_info_to_local()

    def download_image(self,image_url,local_path):
        if not image_url:
            return False
        download = requests.get(image_url)
        if download.status_code == 200:
            with open(local_path, 'wb') as write_handle:
                write_handle.write(download.content)
            magick.create_thumbnail(local_path=local_path,force_overwrite=True)
            db.op.update_job(job_id=self.job_id, message=f"Downloaded {image_url} to {local_path}")
            return True
        return False

    def get_image_path(self):
        pass

    def has_nfo(self):
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

    def schedule_subjobs(self,update_images:bool,update_metadata:bool):
        pass