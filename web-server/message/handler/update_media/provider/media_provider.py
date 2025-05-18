class MediaProvider:
    def __init__(self,kind):
        self.kind = kind


    def get_movie_info(self, metadata_id:int):
        pass

    def get_movie_images(self, metadata_id:int):
        pass

    def get_show_info(self, metadata_id:int):
        pass

    def get_show_images(self, metadata_id:int):
        pass

    def get_season_info(self, metadata_id:int, season_order:int):
        pass

    def get_season_images(self, metadata_id:int, season_order:int):
        pass

    def get_episode_info(self, metadata_id:int, season_order:int, episode_order:int):
        pass

    def get_episode_images(self, metadata_id:int, season_order:int, episode_order:int):
        pass