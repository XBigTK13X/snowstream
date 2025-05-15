import message.handler.update_media.provider.media_provider as base
import tvdb_v4_official
from settings import config
from db import db
import json
from log import log

# https://github.com/thetvdb/tvdb-v4-python
# https://github.com/thetvdb/tvdb-v4-python/blob/main/tvdb_v4_official.py
class ThetvdbProvider(base.MediaProvider):
    def __init__(self):
        super().__init__("thetvdb")
        self.tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)

    def get_movie_info(self, metadata_id:int):
        cache_key = f'tvdb-movie-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Movie result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Movie result for {metadata_id} is stale, read from tvdb")
        movie = self.tvdb_client.get_movie(id=metadata_id)
        movie['tvdb_translation'] = self.tvdb_client.get_movie_translation(id=metadata_id,lang='eng')
        movie['tvdb_extended'] = self.tvdb_client.get_movie_extended(id=metadata_id)
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(movie))
        return movie

    def get_show_info(self, metadata_id:int):
        cache_key = f'tvdb-show-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Show result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Show result for {metadata_id} is stale, read from tvdb")
        show = self.tvdb_client.get_series(id=metadata_id)
        show['tvdb_extended'] = self.tvdb_client.get_series_extended(id=metadata_id)
        show['tvdb_translation'] = self.tvdb_client.get_series_translation(id=metadata_id,lang='eng')
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(show))
        return show

    def filter_season(self, episodes, season_order:int):
        return

    def get_show_episodes(self, metadata_id: int):
        cache_key = f'tvdb-show-{metadata_id}-episodes'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Show episodes result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)['episodes']
        currentPage = 0
        api_results = None
        log.info(f"Show episodes result for {metadata_id} is stale, read from tvdb [{cache_key}]")
        while True:
            current_results = self.tvdb_client.get_series_episodes(
                id=metadata_id,
                season_type='default',
                lang='eng',
                page=currentPage
            )
            if not current_results:
                break
            if 'episodes' in current_results and len(current_results['episodes']) == 0:
                break
            if not api_results:
                api_results = current_results
            else:
                api_results['episodes'] += current_results['episodes']
            currentPage += 1
        if not api_results:
            return None
        api_results['episodes'] = sorted(api_results['episodes'],key=lambda xx:[xx['seasonNumber'],xx['number']])
        db.op.upsert_cached_text(key=cache_key, data=json.dumps(api_results))
        return api_results['episodes']

    def get_season_info(self, show_metadata_id:int, season_order:int):
        cache_key = f'tvdb-show-{show_metadata_id}-season-{season_order}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Season result for {show_metadata_id} {season_order} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Season result for {show_metadata_id} {season_order} is stale, read from tvdb [{cache_key}]")
        show = self.get_show_info(metadata_id=show_metadata_id)
        season = [xx for xx in show['tvdb_extended']['seasons'] if int(xx['number']) == int(season_order)][0]
        season['details'] = self.tvdb_client.get_season(id=season['id'])
        season['extended'] = self.tvdb_client.get_season_extended(id=season['id'])
        season['episodes'] = [xx for xx in self.get_show_episodes(metadata_id=show_metadata_id) if int(xx['seasonNumber']) == int(season_order)]
        db.op.upsert_cached_text(key=cache_key, data=json.dumps(season))
        return season

    def get_episode_info(self, show_metadata_id:int, season_order:int, episode_order:int):
        episodes = self.get_show_episodes(metadata_id=show_metadata_id)
        if not episodes:
            return None
        for episode in episodes:
            if int(episode['seasonNumber']) == int(season_order) and int(episode['number']) == episode_order:
                return episode
        return None