class MediaProvider:
    def __init__(self,kind):
        self.kind = kind


    def get_movie_info(self, metadataId):
        pass

    def get_show_info(self, metadataId):
        pass

    def get_season_info(self, metadataId, seasonOrder):
        pass

    def get_episode_info(self, metadataId, seasonOrder, episodeOrder):
        pass