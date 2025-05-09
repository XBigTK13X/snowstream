import message.handler.update_media.base_handler as base

class Show(base.BaseHandler):
    def __init__(self,show_id:int):
        super().__init__("Show")
        self.show_id = show_id

    def read_remote_info(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        return self.media_provider.get_show_info(metadataId=metadataId)