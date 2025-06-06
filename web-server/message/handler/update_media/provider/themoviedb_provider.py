import message.handler.update_media.provider.media_provider as base
from themoviedb import TMDb
from themoviedb import utils as tmdb_utils
from settings import config
from db import db
import json
from log import log

# https://developer.themoviedb.org/docs/getting-started
# https://github.com/leandcesar/themoviedb
# https://github.com/leandcesar/themoviedb/tree/master/themoviedb/routes_sync
# https://github.com/leandcesar/themoviedb/tree/master/themoviedb/schemas
class ThemoviedbProvider(base.MediaProvider):
    def __init__(self):
        super().__init__("themoviedb")
        self.tmdb_client = TMDb(key=config.themoviedb_api_key, language="EN", region="US")

    def get_movie_info(self, metadata_id:int):
        cache_key = f'tmdb-movie-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Movie result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Movie result for {metadata_id} is stale, read from tmdb")
        details = self.tmdb_client.movie(movie_id=metadata_id).details()
        movie = tmdb_utils.as_dict(details)
        movie['poster_url'] = details.poster_url()

        db.op.upsert_cached_text(key=cache_key,data=json.dumps(movie))
        return movie

    def get_movie_images(self, metadata_id:int):
        movie_info = self.get_movie_info(metadata_id=metadata_id)
        if not movie_info['poster_url']:
            return None
        return {
            'poster': movie_info['poster_url']
        }

    def get_show_info(self, metadata_id:int):
        cache_key = f'tmdb-show-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Show result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)

        log.info(f"Show result for {metadata_id} is stale, read from tmdb")
        details = self.tmdb_client.tv(tv_id=metadata_id).details()
        show = tmdb_utils.as_dict(details)
        show['poster_url'] = details.poster_url()
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(show))
        return show

    def get_show_images(self, metadata_id:int):
        show_info = self.get_show_info(metadata_id=metadata_id)
        if not show_info['poster_url']:
            return None
        return {
            'poster': show_info['poster_url']
        }

    def get_season_info(self, show_metadata_id:int, season_order:int):
        cache_key = f'tmdb-show-{show_metadata_id}-season-{season_order}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Season result for {show_metadata_id} {season_order} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        log.info(f"Season result for {show_metadata_id} {season_order} is stale, read from tmdb [{cache_key}]")
        show = self.get_show_info(metadata_id=show_metadata_id)
        season = [xx for xx in show['tvdb_extended']['seasons'] if int(xx['number']) == int(season_order)][0]
        season['details'] = self.tvdb_client.get_season(id=season['id'])
        season['extended'] = self.tvdb_client.get_season_extended(id=season['id'])
        season['episodes'] = [xx for xx in self.get_show_episodes(metadata_id=show_metadata_id) if int(xx['seasonNumber']) == int(season_order)]
        db.op.upsert_cached_text(key=cache_key, data=json.dumps(season))
        return season

    def get_season_images(self, metadata_id:int, season_order:int):
        season_info = self.get_season_info(show_metadata_id=metadata_id,season_order=season_order)
        if not 'extended' in season_info and not 'artwork' in season_info['extended']:
            return None
        return self.filter_images(season_info['extended']['artwork'])

    def get_show_episodes(self, metadata_id: int):
        cache_key = f'tmdb-show-{metadata_id}-episodes'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"Show episodes result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)['episodes']
        currentPage = 0
        api_results = None
        log.info(f"Show episodes result for {metadata_id} is stale, read from tmdb [{cache_key}]")
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

    def get_episode_info(self, show_metadata_id:int, season_order:int, episode_order:int):
        episodes = self.get_show_episodes(metadata_id=show_metadata_id)
        if not episodes:
            return None
        for episode in episodes:
            if int(episode['seasonNumber']) == int(season_order) and int(episode['number']) == episode_order:
                return episode
        return None

    def get_episode_images(self, show_metadata_id:int, season_order:int, episode_order:int):
        episode_info = self.get_episode_info(show_metadata_id=show_metadata_id, season_order=season_order, episode_order=episode_order)
        if not 'image' in episode_info or not episode_info['image']:
            return None
        if not 'https://artworks.thetvdb.com/' in episode_info['image']:
            episode_info['image'] = 'https://artworks.thetvdb.com'+episode_info['image']
        return {
            'screencap': episode_info['image']
        }

    def identify(self, kind:str, query:str, year:int=None):
        cache_key = f'tmdb-identify-{kind}-{query}'
        if year:
            cache_key = f'tmdb-identify-{kind}-{year}-{query}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            log.info(f"{kind} result for {query} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)

        results = []
        if kind == 'Show':
            api_result = self.tmdb_client.search().tv(
                query=query,
                first_air_date_year=year
            )
            for show in api_result.results:
                results.append({
                    'tvdbid': None,
                    'remote_id': show.id,
                    'remote_source': 'themoviedb',
                    'name': show.name,
                    'year': show.year,
                    'poster_url': show.poster_url(),
                    'overview': show.overview
                })
        else:
            api_result = self.tmdb_client.search().movies(
                query=query,
                year=year
            )
            for movie in api_result.results:
                results.append({
                    'name': movie.title,
                    'remote_id': movie.id,
                    'remote_source': 'themoviedb',
                    'tvdbid': None,
                    'year': movie.year,
                    'poster_url': movie.poster_url(),
                    'overview': movie.overview
                })

        db.op.upsert_cached_text(key=cache_key, data=json.dumps(results))
        return results

    def to_snowstream_movie(self, metadata:dict):
        result = {
            'tagline': None,
            'plot': None,
            'release_date': None,
            'year': int(metadata['year']),
            'tvdbid': int(metadata['id']),
            'tmdbid': None,
            'name': metadata['name']
        }
        if 'tvdb_translation' in metadata:
            if 'tagline' in metadata['tvdb_translation']:
                result['tagline'] = metadata['tvdb_translation']['tagline']
            if 'overview' in metadata['tvdb_translation']:
                result['plot'] = metadata['tvdb_translation']['overview']
        if 'tvdb_extended' in metadata:
            if 'first_release' in metadata['tvdb_extended']:
                result['release_date'] = metadata['tvdb_extended']['first_release']['date']
        return result

    def to_snowstream_episodes(self, metadata:list[dict]):
        first = metadata[0]
        result = {
            'overview': first['overview'] if 'overview' in first else None,
            'tvdbid': int(first['id']),
            'tmdbid': None,
            'episode': int(first['number']),
            'season': int(first['seasonNumber']),
            'name': first['name'],
            'year': int(first['year']),
            'aired': first['aired'] if 'aired' in first else None
        }
        if len(metadata) > 1:
            result['overview'] = ' '.join([f'[Episode {xx['number']}] {xx['overview']}' for xx in metadata])
            result['name'] =  ' + '.join(xx['name'] for xx in self.tvdb_info if 'name' in xx)
        return result

    def to_snowstream_season(self, metadata:dict):
        result = {
            'tvdbid': int(metadata['id']),
            'tmdbid': None,
            'release_date': None
        }
        if 'episodes' in metadata and len(metadata['episodes']) > 0:
            result['release_date'] = metadata['episodes'][0]['aired']
        if 'details' in metadata and 'year' in metadata['details']:
            result['year'] = int(metadata['details']['year'])

        return result

    def to_snowstream_show(self, metadata:dict):
        result = {
            'tvdbid': int(metadata['id']),
            'tmdbid': None,
            'release_date': metadata['firstAired'],
            'year': int(metadata['year']),
            'name': None
        }

        if 'tvdb_translation' in metadata:
            if 'name' in metadata['tvdb_translation']:
                result['name'] = metadata['tvdb_translation']['overview']
            if 'overview' in metadata['tvdb_translation']:
                result['overview'] = metadata['tvdb_translation']['overview']
        return result
