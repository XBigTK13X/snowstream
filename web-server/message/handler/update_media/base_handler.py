from db import db
from log import log
from settings import config
import nfo
import os
import message.handler.update_media.provider.thetvdb_provider as thetvdb
import message.write
import requests
import magick

class BaseHandler:
    def __init__(self, kind):
        self.kind = kind
        self.media_provider = thetvdb.ThetvdbProvider()
        self.db = db
        self.nfo = nfo
        self.ticket = db.model.Ticket()
        self.log = log

    def make_job(self, name:str, payload:dict):
        job = self.db.op.create_job(kind=name)
        message.write.send(job_id=job.id, kind=name, input=payload)

    def download_image(self,image_url,local_path):
        if not image_url:
            return False
        download = requests.get(image_url)
        if download.status_code == 200:
            with open(local_path, 'wb') as write_handle:
                write_handle.write(download.content)
            magick.create_thumbnail(local_path=local_path,force_overwrite=True)
            log.info(f"Downloaded {image_url} to {local_path}")
            return True
        return False

    def read_local_info(self):
        pass

    def read_remote_info(self):
        pass

    def merge_remote_into_local(self):
        pass

    def save_info_to_local(self):
        pass

    def download_images(self):
        pass

    def schedule_subjobs(self,update_images:bool,update_metadata:bool):
        pass