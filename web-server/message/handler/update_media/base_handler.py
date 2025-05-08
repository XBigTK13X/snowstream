from db import db
from log import log
from settings import config

import message.handler.update_media.provider.thetvdb_provider as thetvdb

class BaseHandler:
    def __init__(self, kind):
        self.kind = kind
        self.media_provider = thetvdb.ThetvdbProvider()

    def read_local_media(self):
        pass

    def read_remote_media(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        pass

    def merge_remote_into_local(self):
        pass

    def save_media_to_local(self):
        pass
