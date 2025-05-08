import message.handler.update_media.provider.media_provider as base
import tvdb_v4_official
from settings import config
from db import db
import json
from log import log

example_episode = '''
Episode dict exmaple

{'absoluteNumber': 1270,
'aired': '2024-05-03',
'finaleType': None,
'id': 10445888,
'image': '/banners/v4/episode/10445888/screencap/663504175d56d.jpg',
'imageType': 11,
'isMovie': 0,
'lastUpdated': '2025-04-28 13:34:02',
'name': 'Sparkle! The Glow of Flame and Art!',
'nameTranslations': None,
'number': 48,
'overview': 'Returning to Artazon once more, Liko, Roy, and Dot meet up with '
        'Hassel, Brassius, and Alex as they prepare for an upcoming arts '
        'festival. Roy is eager to start his Tera Training aptitude test '
        'against Brassius, but the Gym Leader is too busy, so Roy battles '
        'Nemona instead. After Roy loses, Brassius tells him he’s not '
        'ready for his test, so the young Trainers work on art projects '
        'in the meantime. The process leads Roy to realize what he’d been '
        'overlooking in battle, and Brassius finally accepts his '
        'challenge. Will Roy and Fuecoco be able to successfully use '
        'Terastallization to pass the test?',
'overviewTranslations': None,
'runtime': 25,
'seasonName': 'Horizons',
'seasonNumber': 20,
'seasons': None,
'seriesId': 76703,
'year': '2024'}
'''

# https://github.com/thetvdb/tvdb-v4-python
# https://github.com/thetvdb/tvdb-v4-python/blob/main/tvdb_v4_official.py
class ThetvdbProvider(base.MediaProvider):
    def __init__(self):
        super().__init__("thetvdb")
        self.tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)

    def get_movie_info(self, metadataId:int):
        cache_key = f'tvdb-movie-{metadataId}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Movie result for {metadataId} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Movie result for {metadataId} is stale, read from tvdb")
        movie = self.tvdb_client.get_movie(id=metadataId)
        movie['tvdb_translation'] = self.tvdb_client.get_movie_translation(id=metadataId,lang='eng')
        movie['tvdb_extended'] = self.tvdb_client.get_movie_extended(id=metadataId)
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(movie))
        return movie

    def get_show_info(self, metadataId:int):
        cache_key = f'tvdb-show-{metadataId}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Show result for {metadataId} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Show result for {metadataId} is stale, read from tvdb")
        show = self.tvdb_client.get_series(id=metadataId)
        show['tvdb_extended'] = self.tvdb_client.get_series_extended(id=metadataId)
        show['tvdb_translation'] = self.tvdb_client.get_series_translation(id=metadataId,lang='eng')
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(show))
        return show

    def filter_season(self, episodes, seasonOrder:int):
        return [xx for xx in episodes if int(xx['seasonNumber']) == int(seasonOrder)]

    def get_season_info(self, metadataId:int, seasonOrder:int):
        show = self.get_show_info(metadataId=metadataId)
        cache_key = f'tvdb-show-{metadataId}-episodes'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Season result for {metadataId} {seasonOrder} is fresh, return cached result [{cache_key}]")
            api_results = json.loads(cached_result)
            return self.filter_season(episodes=api_results['episodes'],seasonOrder=seasonOrder)
        currentPage = 0
        api_results = None
        log.info(f"Season result for {metadataId} {seasonOrder} is stale, return cached result [{cache_key}]")
        while True:
            current_results = self.tvdb_client.get_series_episodes(
                id=show['id'],
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
        return self.filter_season(episodes=api_results['episodes'],seasonOrder=seasonOrder)

    def get_episode_info(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        season = self.get_season_info(metadataId=metadataId,seasonOrder=seasonOrder)
        if season == None:
            return None
        for episode in season['episode']:
            if episode['number'] == episodeOrder:
                return episode
        return None


