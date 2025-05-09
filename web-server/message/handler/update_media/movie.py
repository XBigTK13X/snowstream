import message.handler.update_media.base_handler as base

class Movie(base.BaseHandler):
    def __init__(self,movie_id:int):
        super().__init__("Movie")
        self.movie_id = movie_id

    def read_remote_info(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        return self.media_provider.get_movie_info(metadataId=metadataId)