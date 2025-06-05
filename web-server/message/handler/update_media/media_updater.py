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
    def __init__(self, kind, scope):
        self.kind = kind
        self.media_provider = scope.get_media_provider()
        self.db = db
        self.nfo = nfo
        self.ticket = db.model.Ticket()
        self.log = log
        self.config = config
        self.FileStub = FileStub

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