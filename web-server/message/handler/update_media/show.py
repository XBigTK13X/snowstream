import message.handler.update_media.base_handler as base

class Show(base.BaseHandler):
    def __init__(self):
        super().__init__("Show")

    def read_remote_media(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        return self.media_provider.get_show_info(metadataId=metadataId)