import message.handler.update_media.base_handler as base

class Movie(base.BaseHandler):
    def __init__(self):
        super().__init__("Movie")

    def read_remote_media(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        return self.media_provider.get_movie_info(metadataId=metadataId)