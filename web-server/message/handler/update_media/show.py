import message.handler.update_media.base_handler as base

class Show(base.BaseHandler):
    def __init__(self,metadata_id:int,show_id:int):
        super().__init__("Show")
        self.show_id = show_id
        self.metadata_id = metadata_id

    def read_remote_info(self):
        return self.media_provider.get_show_info(metadata_id=self.metadata_id)