from db import db
from log import log
from settings import config

import message.handler.update_media.provider.thetvdb_provider as thetvdb

import message.write

class BaseHandler:
    def __init__(self, kind):
        self.kind = kind
        self.media_provider = thetvdb.ThetvdbProvider()
        self.db = db
        self.ticket = db.model.Ticket()

    def make_job(self, name:str, payload:dict):
        job = self.db.op.create_job(kind=name)
        message.write.send(job_id=job.id, kind=name, input=payload)

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

    def schedule_subjobs(self):
        pass