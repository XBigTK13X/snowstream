import message.handler.update_media.provider.media_provider as base

import tvdb_v4_official

from settings import config

# https://github.com/thetvdb/tvdb-v4-python
class ThetvdbProvider(base.MediaProvider):
    def __init__(self):
        super().__init__("thetvdb")
        self.tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)

    def get_movie_info(self, metadataId:int):
        movie = self.tvdb_client.get_movie(metadataId)
        return movie

    def get_show_info(self, metadataId:int):
        show = self.tvdb_client.get_series(metadataId)
        return show

    def get_season_info(self, metadataId:int, seasonOrder:int):
        print(metadataId)
        print(seasonOrder)
        show = self.tvdb_client.get_series_extended(metadataId)
        print(show)
        for season in sorted(show["seasons"], key=lambda x: (x["type"]["name"], x["number"])):
            if season["type"]["name"] == "Aired Order" and season["number"] == seasonOrder:
                return self.tvdb_client.get_season_extended(season["id"])
        return None

    def get_episode_info(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        season = self.tvdb_client.get_season_info(metadataId=metadataId, seasonOrder=seasonOrder)
        if season == None:
            return None
        for episode in season['episode']:
            if episode['number'] == episodeOrder:
                return episode
        return None


