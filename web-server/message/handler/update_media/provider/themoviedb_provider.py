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
    def __init__(self,job_id:int=None,metadata_source:str=None):
        super().__init__(job_id,"themoviedb",metadata_source)
        self.tmdb_client = TMDb(key=config.themoviedb_api_key, language="EN", region="US")

    def identify(self, kind:str, query:str, year:int=None):
        cache_key = f'tmdb-identify-{kind}-{query}'
        if year:
            cache_key = f'tmdb-identify-{kind}-{year}-{query}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"{kind} result for {query} is fresh, return cached result [{cache_key}]")
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
                    'remote_id_source': 'themoviedb',
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
                    'remote_id_source': 'themoviedb',
                    'tvdbid': None,
                    'year': movie.year,
                    'poster_url': movie.poster_url(),
                    'overview': movie.overview
                })

        db.op.upsert_cached_text(key=cache_key, data=json.dumps(results))
        return results

    def get_movie_info(self, metadata_id:int):
        cache_key = f'tmdb-movie-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Movie result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        db.op.update_job(job_id=self.job_id, message=f"Movie result for {metadata_id} is stale, read from tmdb")
        details = self.tmdb_client.movie(movie_id=metadata_id).details()
        movie = tmdb_utils.as_dict(details)
        movie['poster_url'] = details.poster_url()
        movie['release_year'] = details.year

        db.op.upsert_cached_text(key=cache_key,data=json.dumps(movie))
        return movie

    def get_movie_images(self, metadata_id:int):
        movie_info = self.get_movie_info(metadata_id=metadata_id)
        if not movie_info['poster_url']:
            return None
        return {
            'poster': movie_info['poster_url']
        }

    def to_snowstream_movie(self, metadata:dict):
        result = {
            'tagline': None,
            'plot': None,
            'release_date': metadata['release_date'],
            'year': int(metadata['release_year']),
            'tmdbid': int(metadata['id']),
            'tvdbid': None,
            'name': metadata['title']
        }
        if 'overview' in metadata:
            result['plot'] = metadata['overview']
        if 'tagline' in metadata:
            result['tagline'] = metadata['tagline']
        return result

    def get_show_info(self, metadata_id:int):
        cache_key = f'tmdb-show-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Show result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)

        db.op.update_job(job_id=self.job_id, message=f"Show result for {metadata_id} is stale, read from tmdb")
        details = self.tmdb_client.tv(tv_id=metadata_id).details()
        show = tmdb_utils.as_dict(details)
        show['poster_url'] = details.poster_url()
        show['release_year'] = details.first_air_date.year
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(show))
        return show

    def get_show_images(self, metadata_id:int):
        show_info = self.get_show_info(metadata_id=metadata_id)
        if not show_info['poster_url']:
            return None
        return {
            'poster': show_info['poster_url']
        }

    def to_snowstream_show(self, metadata:dict):
        result = {
            'tmdbid': int(metadata['id']),
            'tvdbid': None,
            'release_date': metadata['first_air_date'],
            'year': int(metadata['release_year']),
            'name': metadata['name'],
            'overview': metadata['overview']
        }
        return result

    def get_season_info(self, show_metadata_id:int, season_order:int):
        cache_key = f'tmdb-show-{show_metadata_id}-season-{season_order}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Season result for {show_metadata_id} {season_order} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)

        db.op.update_job(job_id=self.job_id, message=f"Season result for {show_metadata_id} {season_order} is stale, read from tmdb [{cache_key}]")
        show = self.get_show_info(metadata_id=show_metadata_id)
        for season in show['seasons']:
            if int(season['season_number']) == int(season_order):
                details = self.tmdb_client.season(tv_id=show_metadata_id,season_id=season_order).details()
                result = tmdb_utils.as_dict(details)
                result['poster_url'] = details.poster_url()
                result['year'] = details.air_date.year
                for ii in range(0,len(details.episodes)):
                    episode = details.episodes[ii]
                    result['episodes'][ii]['still_url'] = episode.still_url()
                    result['episodes'][ii]['year'] = episode.air_date.year
                db.op.upsert_cached_text(key=cache_key, data=json.dumps(result))
                return result
        return None

    def get_season_images(self, show_metadata_id:int, season_order:int):
        season_info = self.get_season_info(show_metadata_id=show_metadata_id,season_order=season_order)
        if not season_info['poster_url']:
            return None
        return {
            'poster': season_info['poster_url']
        }


    def to_snowstream_season(self, metadata:dict):
        result = {
            'tmdbid': int(metadata['id']),
            'tvdbid': None,
            'release_date': metadata['air_date'],
            'year': metadata['year']
        }

        return result


    def get_episode_info(self, show_metadata_id:int, season_order:int, episode_order:int):
        season = self.get_season_info(show_metadata_id=show_metadata_id,season_order=season_order)
        for episode in season['episodes']:
            if int(episode['episode_number']) == int(episode_order):
                return episode
        return None

    def get_episode_images(self, show_metadata_id:int, season_order:int, episode_order:int):
        episode_info = self.get_episode_info(show_metadata_id=show_metadata_id, season_order=season_order, episode_order=episode_order)
        if not 'still_url' in episode_info:
            return None
        return {
            'screencap': episode_info['still_url']
        }

    def to_snowstream_episodes(self, metadata:list[dict]):
        first = metadata[0]
        result = {
            'overview': first['overview'],
            'tmdbid': int(first['id']),
            'tvdbid': None,
            'episode': first['episode_number'],
            'season': first['season_number'],
            'name': first['name'],
            'year': first['year'],
            'aired': first['air_date']
        }
        if len(metadata) > 1:
            result['overview'] = ' '.join([f"[Episode {xx['episode_number']}] {xx['overview']}" for xx in metadata])
            result['name'] =  ' + '.join(xx['name'] for xx in self.tvdb_info if 'name' in xx)
        return result