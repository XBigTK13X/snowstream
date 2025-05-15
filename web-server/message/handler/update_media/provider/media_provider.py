class MediaProvider:
    def __init__(self,kind):
        self.kind = kind


    def get_movie_info(self, metadata_id):
        pass

    def get_show_info(self, metadata_id):
        pass

    def get_season_info(self, metadata_id, season_order):
        pass

    def get_episode_info(self, metadata_id, season_order, episode_order):
        pass