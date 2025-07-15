class MediaProvider:
    def __init__(self, job_id:int, kind:str, metadata_source:str):
        self.job_id = job_id
        self.kind = kind
        self.metadata_source = metadata_source


    def get_movie_info(self, metadata_id:int):
        pass

    def get_movie_images(self, metadata_id:int):
        pass

    def get_show_info(self, metadata_id:int):
        pass

    def get_show_images(self, metadata_id:int):
        pass

    def get_season_info(self, show_metadata_id:int, season_order:int):
        pass

    def get_season_images(self, show_metadata_id:int, season_order:int):
        pass

    def get_episode_info(self, show_metadata_id:int, season_order:int, episode_order:int):
        pass

    def get_episode_images(self, show_metadata_id:int, season_order:int, episode_order:int):
        pass

    def identify(self, kind:str, query:str, year:int=None):
        pass

    def to_snowstream_movie(self, metadata:dict):
        return metadata

    def to_snowstream_episodes(self, metadata:list[dict]):
        return metadata

    def to_snowstream_season(self, metadata:dict):
        return metadata

    def to_snowstream_show(self, metadata:dict):
        return metadata

