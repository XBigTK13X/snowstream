import message.handler.update_media.base_handler as base

class Movie(base.BaseHandler):
    def __init__(self,movie_id:int):
        super().__init__("Movie")
        self.movie_id = movie_id

    def read_remote_info(self, metadata_id:int):
        self.metadata_id = metadata_id
        return self.media_provider.get_movie_info(metadata_id=metadata_id)