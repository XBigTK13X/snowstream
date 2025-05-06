import message.handler.update_media.base_handler as base

class ShowSeason(base.BaseHandler):
    def __init__(self):
        super().__init__("ShowSeason")

    def read_remote_media(self, metadataId:int, seasonOrder:int):
        return self.media_provider.get_season_info(metadataId=metadataId, seasonOrder=seasonOrder)