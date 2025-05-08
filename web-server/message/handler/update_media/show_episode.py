import message.handler.update_media.base_handler as base

class ShowEpisode(base.BaseHandler):
    def __init__(self):
        super().__init__("ShowEpisode")

    def read_remote_media(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        return self.media_provider.get_episode_info(
            metadataId=metadataId,
            seasonOrder=seasonOrder,
            episodeOrder=episodeOrder
        )