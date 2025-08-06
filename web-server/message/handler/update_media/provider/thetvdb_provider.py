import message.handler.update_media.provider.media_provider as base
import tvdb_v4_official
from settings import config
from db import db
import json
from log import log

# https://github.com/thetvdb/tvdb-v4-python
# https://github.com/thetvdb/tvdb-v4-python/blob/main/tvdb_v4_official.py
# https://thetvdb.github.io/v4-api
class ThetvdbProvider(base.MediaProvider):
    def __init__(self, job_id:int=None, metadata_source:str=None):
        super().__init__(job_id,"thetvdb",metadata_source)
        self.tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)
        self.artwork_kinds = {}
        for artwork_type in ARTWORK_TYPES_RAW:
            slug = f"{artwork_type['recordType']}-{artwork_type['name']}".lower()
            self.artwork_kinds[artwork_type['id']] = slug
            self.artwork_kinds[str(artwork_type['id'])] = slug
        self.season_order_kind = None
        if metadata_source and '--' in metadata_source:
            parts = metadata_source.split('--')
            for ii in range(1,len(parts)):
                part = parts[ii]
                k,v = part.split('=')
                if k == 'order_kind':
                    self.season_order_kind = v

    def get_movie_info(self, metadata_id:int):
        cache_key = f'tvdb-movie-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Movie result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        db.op.update_job(job_id=self.job_id, message=f"Movie result for {metadata_id} is stale, read from tvdb")
        movie = self.tvdb_client.get_movie(id=metadata_id)
        movie['tvdb_translation'] = self.tvdb_client.get_movie_translation(id=metadata_id,lang='eng')
        movie['tvdb_extended'] = self.tvdb_client.get_movie_extended(id=metadata_id)
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(movie))
        return movie

    def get_movie_images(self, metadata_id:int):
        movie_info = self.get_movie_info(metadata_id=metadata_id)
        if not 'tvdb_extended' in movie_info and not 'artworks' in movie_info['tvdb_extended']:
            return None
        return self.filter_images(movie_info['tvdb_extended']['artworks'])

    def load_show_order_kind(self, show):
        if self.season_order_kind:
            show['order_kind'] = self.season_order_kind
            return show
        else:
            order_id = int(show['defaultSeasonType'])
            for order_kind in show['tvdb_extended']['seasonTypes']:
                if int(order_kind['id']) == order_id:
                    show['order_kind'] = order_kind['type']
                    return show
        show['order_kind'] = 'official'
        return show

    def get_show_info(self, metadata_id:int):
        cache_key = f'tvdb-show-{metadata_id}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Show result for {metadata_id} is fresh, return cached result [{cache_key}]")
            return self.load_show_order_kind(json.loads(cached_result))
        db.op.update_job(job_id=self.job_id, message=f"Show result for {metadata_id} is stale, read from tvdb")
        show = self.tvdb_client.get_series(id=metadata_id)
        show['tvdb_extended'] = self.tvdb_client.get_series_extended(id=metadata_id)
        show['tvdb_translation'] = self.tvdb_client.get_series_translation(id=metadata_id,lang='eng')
        db.op.upsert_cached_text(key=cache_key,data=json.dumps(show))
        return self.load_show_order_kind(show)

    def get_show_images(self, metadata_id:int):
        show_info = self.get_show_info(metadata_id=metadata_id)
        if not 'tvdb_extended' in show_info and not 'artworks' in show_info['tvdb_extended']:
            return None
        return self.filter_images(show_info['tvdb_extended']['artworks'])

    def get_season_info(self, show_metadata_id:int, season_order:int):
        show = self.get_show_info(metadata_id=show_metadata_id)
        cache_key = f'tvdb-show-{show_metadata_id}-season-{season_order}-{show["order_kind"]}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Season result for {show_metadata_id} {season_order} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        db.op.update_job(job_id=self.job_id, message=f"Season result for {show_metadata_id} {season_order} is stale, read from tvdb [{cache_key}]")
        season = None
        for ss in show['tvdb_extended']['seasons']:
            if int(ss['number']) == int(season_order) and ss['type']['type'] == show['order_kind']:
                season = ss
        season['details'] = self.tvdb_client.get_season(id=season['id'])
        season['extended'] = self.tvdb_client.get_season_extended(id=season['id'])
        season['episodes'] = [xx for xx in self.get_show_episodes(show_metadata_id=show_metadata_id) if int(xx['seasonNumber']) == int(season_order)]
        db.op.upsert_cached_text(key=cache_key, data=json.dumps(season))
        return season

    def get_season_images(self, show_metadata_id:int, season_order:int):
        season_info = self.get_season_info(show_metadata_id=show_metadata_id,season_order=season_order)
        if not 'extended' in season_info and not 'artwork' in season_info['extended']:
            return None
        return self.filter_images(season_info['extended']['artwork'])

    def get_show_episodes(self, show_metadata_id: int):
        show = self.get_show_info(metadata_id=show_metadata_id)
        cache_key = f'tvdb-show-{show_metadata_id}-episodes-{show["order_kind"]}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"Show episodes result for {show_metadata_id} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)['episodes']
        currentPage = 0
        api_results = None
        db.op.update_job(job_id=self.job_id, message=f"Show episodes result for {show_metadata_id} is stale, read from tvdb [{cache_key}]")
        while True:
            current_results = self.tvdb_client.get_series_episodes(
                id=show_metadata_id,
                season_type=show['order_kind'],
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
        episodes = self.get_show_episodes(show_metadata_id=show_metadata_id)
        if not episodes:
            return None
        for episode in episodes:
            if int(episode['seasonNumber']) == season_order and int(episode['number']) == episode_order:
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

    def filter_images(self, images):
        poster = None
        poster_score = -1
        banner = None
        banner_score = -1
        screencap = None
        screencap_score = -1
        for image in images:
            if image['score'] < 100000:
                image['score'] = 100000
            kind = self.artwork_kinds[image['type']]
            # A lot of tvdb scores start at 100000
            # We tend to want to ignore foreign language images
            if 'language' in image:
                if image['language'] == 'eng':
                    image['score'] += 1000
                elif image['language'] == None:
                    image['score'] += 100
            if 'includesText' in image and image['includesText'] == True:
                image['score'] += 2000

            if 'poster' in kind and image['score'] > poster_score:
                poster_score = image['score']
                poster = image['image']
            elif 'banner' in kind and image['score'] > banner_score:
                banner_score = image['score']
                banner = image['image']
            elif 'screen' in kind and image['score'] > screencap_score:
                screencap_score = image['score']
                screencap = image['image']
        return {
            'poster': poster,
            'banner': banner,
            'screencap': screencap
        }

    def identify(self, kind:str, query:str, year:int=None):
        cache_key = f'tvdb-identify-{kind}-{query}'
        if year:
            cache_key = f'tvdb-identify-{kind}-{year}-{query}'
        cached_result = db.op.get_cached_text_by_key(cache_key)
        if cached_result:
            db.op.update_job(job_id=self.job_id, message=f"{kind} result for {query} is fresh, return cached result [{cache_key}]")
            return json.loads(cached_result)
        tvdb_type = 'movie'
        if kind == 'Show':
            tvdb_type = 'series'
        api_results = None
        if year:
            api_results = self.tvdb_client.search(
                query=query,
                type=tvdb_type,
                year=year
            )
        else:
            api_results = self.tvdb_client.search(
                query=query,
                type=tvdb_type
            )
        results = []
        for result in api_results:
            results.append({
                'name': result['name'],
                'remote_id': int(result['tvdb_id']),
                'remote_id_source': 'thetvdb',
                'tmdbid': None,
                'year': int(result['year']),
                'poster_url': result['thumbnail'],
                'overview': result['overview'] if 'overview' in result else None
            })
        db.op.upsert_cached_text(key=cache_key, data=json.dumps(results))
        return results

    def to_snowstream_movie(self, metadata:dict):
        result = {
            'tagline': None,
            'plot': None,
            'release_date': None,
            'year': int(metadata['year']) if 'year' in metadata else None,
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
            'year': int(first['year']) if 'year' in first else None,
            'aired': first['aired'] if 'aired' in first else None
        }
        if len(metadata) > 1:
            result['overview'] = ' '.join([f"[Episode {xx['number']}] {xx['overview']}" for xx in metadata])
            result['name'] =  ' + '.join(xx['name'] for xx in metadata if 'name' in xx)
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
            'year': int(metadata['year']) if 'year' in metadata else None,
            'name': None
        }

        if 'tvdb_translation' in metadata:
            if 'name' in metadata['tvdb_translation']:
                result['name'] = metadata['tvdb_translation']['name']
            if 'overview' in metadata['tvdb_translation']:
                result['overview'] = metadata['tvdb_translation']['overview']
        return result

ARTWORK_TYPES_RAW = [
{'height': 140,
  'id': 1,
  'imageFormat': 'JPG',
  'name': 'Banner',
  'recordType': 'series',
  'slug': 'banners',
  'thumbHeight': 140,
  'thumbWidth': 758,
  'width': 758},
 {'height': 1000,
  'id': 2,
  'imageFormat': 'JPG',
  'name': 'Poster',
  'recordType': 'series',
  'slug': 'posters',
  'thumbHeight': 500,
  'thumbWidth': 340,
  'width': 680},
 {'height': 1080,
  'id': 3,
  'imageFormat': 'JPG',
  'name': 'Background',
  'recordType': 'series',
  'slug': 'backgrounds',
  'thumbHeight': 360,
  'thumbWidth': 640,
  'width': 1920},
 {'height': 1024,
  'id': 5,
  'imageFormat': 'PNG',
  'name': 'Icon',
  'recordType': 'series',
  'slug': 'icons',
  'thumbHeight': 512,
  'thumbWidth': 512,
  'width': 1024},
 {'height': 140,
  'id': 6,
  'imageFormat': 'JPG',
  'name': 'Banner',
  'recordType': 'season',
  'slug': 'banners',
  'thumbHeight': 140,
  'thumbWidth': 758,
  'width': 758},
 {'height': 1000,
  'id': 7,
  'imageFormat': 'JPG',
  'name': 'Poster',
  'recordType': 'season',
  'slug': 'posters',
  'thumbHeight': 500,
  'thumbWidth': 340,
  'width': 680},
 {'height': 1080,
  'id': 8,
  'imageFormat': 'JPG',
  'name': 'Background',
  'recordType': 'season',
  'slug': 'backgrounds',
  'thumbHeight': 360,
  'thumbWidth': 640,
  'width': 1920},
 {'height': 1024,
  'id': 10,
  'imageFormat': 'PNG',
  'name': 'Icon',
  'recordType': 'season',
  'slug': 'icons',
  'thumbHeight': 512,
  'thumbWidth': 512,
  'width': 1024},
 {'height': 360,
  'id': 11,
  'imageFormat': 'JPG',
  'name': '16:9 Screencap',
  'recordType': 'episode',
  'slug': 'screencap',
  'thumbHeight': 360,
  'thumbWidth': 640,
  'width': 640},
 {'height': 480,
  'id': 12,
  'imageFormat': 'JPG',
  'name': '4:3 Screencap',
  'recordType': 'episode',
  'slug': 'screencap',
  'thumbHeight': 480,
  'thumbWidth': 640,
  'width': 640},
 {'height': 450,
  'id': 13,
  'imageFormat': 'JPG',
  'name': 'Photo',
  'recordType': 'actor',
  'slug': 'photo',
  'thumbHeight': 450,
  'thumbWidth': 300,
  'width': 300},
 {'height': 1000,
  'id': 14,
  'imageFormat': 'JPG',
  'name': 'Poster',
  'recordType': 'movie',
  'slug': 'posters',
  'thumbHeight': 500,
  'thumbWidth': 340,
  'width': 680},
 {'height': 1080,
  'id': 15,
  'imageFormat': 'JPG',
  'name': 'Background',
  'recordType': 'movie',
  'slug': 'backgrounds',
  'thumbHeight': 360,
  'thumbWidth': 640,
  'width': 1920},
 {'height': 140,
  'id': 16,
  'imageFormat': 'JPG',
  'name': 'Banner',
  'recordType': 'movie',
  'slug': 'banners',
  'thumbHeight': 140,
  'thumbWidth': 758,
  'width': 758},
 {'height': 1024,
  'id': 18,
  'imageFormat': 'PNG',
  'name': 'Icon',
  'recordType': 'movie',
  'slug': 'icons',
  'thumbHeight': 512,
  'thumbWidth': 512,
  'width': 1024},
 {'height': 512,
  'id': 19,
  'imageFormat': 'PNG',
  'name': 'Icon',
  'recordType': 'company',
  'slug': 'icons',
  'thumbHeight': 256,
  'thumbWidth': 256,
  'width': 512},
 {'height': 720,
  'id': 20,
  'imageFormat': 'MP4',
  'name': 'Cinemagraph',
  'recordType': 'series',
  'slug': 'cinemagraphs',
  'thumbHeight': 720,
  'thumbWidth': 1280,
  'width': 1280},
 {'height': 720,
  'id': 21,
  'imageFormat': 'MP4',
  'name': 'Cinemagraph',
  'recordType': 'movie',
  'slug': 'cinemagraphs',
  'thumbHeight': 720,
  'thumbWidth': 1280,
  'width': 1280},
 {'height': 562,
  'id': 22,
  'imageFormat': 'PNG',
  'name': 'ClearArt',
  'recordType': 'series',
  'slug': 'clearart',
  'thumbHeight': 281,
  'thumbWidth': 500,
  'width': 1000},
 {'height': 310,
  'id': 23,
  'imageFormat': 'PNG',
  'name': 'ClearLogo',
  'recordType': 'series',
  'slug': 'clearlogo',
  'thumbHeight': 155,
  'thumbWidth': 400,
  'width': 800},
 {'height': 562,
  'id': 24,
  'imageFormat': 'PNG',
  'name': 'ClearArt',
  'recordType': 'movie',
  'slug': 'clearart',
  'thumbHeight': 281,
  'thumbWidth': 500,
  'width': 1000},
 {'height': 310,
  'id': 25,
  'imageFormat': 'PNG',
  'name': 'ClearLogo',
  'recordType': 'movie',
  'slug': 'clearlogo',
  'thumbHeight': 155,
  'thumbWidth': 400,
  'width': 800},
 {'height': 1024,
  'id': 26,
  'imageFormat': 'PNG',
  'name': 'Icon',
  'recordType': 'award',
  'slug': 'icons',
  'thumbHeight': 512,
  'thumbWidth': 512,
  'width': 1024},
 {'height': 1000,
  'id': 27,
  'imageFormat': 'JPG',
  'name': 'Poster',
  'recordType': 'list',
  'slug': 'posters',
  'thumbHeight': 500,
  'thumbWidth': 340,
  'width': 680}
]
