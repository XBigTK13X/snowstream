from settings import config
from themoviedb import TMDb
from message.handler.update_media.provider.themoviedb_provider import ThemoviedbProvider

import pprint

# To run use
# `python -m bin.tmdbapi`

def test_search_raw():
    tmdb_client = TMDb(key=config.themoviedb_api_key, language="EN", region="US")
    search_results = tmdb_client.search().movies(query="Abominable", year=2019)
    movie_result = tmdb_client.movie(movie_id=search_results.results[0].id).details()
    import pprint
    print("Movies")
    pprint.pprint(search_results)
    print("Movie")
    pprint.pprint(movie_result)

def test_identify():
    provider = ThemoviedbProvider()
    movie_identity = provider.identify(kind='Movie', query='Abominable', year=2019) # 431580
    pprint.pprint(movie_identity)
    show_identity = provider.identify(kind='Show', query='Bluey') # 82728
    pprint.pprint(show_identity)

def test_get_movie():
    provider = ThemoviedbProvider()
    movie = provider.get_movie_info(metadata_id=671) # Harry Potter (in a collection)
    pprint.pprint(movie)
    images = provider.get_movie_images(metadata_id=671)
    pprint.pprint(images)

def test_get_show():
    provider = ThemoviedbProvider()
    show = provider.get_show_info(metadata_id=82728)
    pprint.pprint(show)
    images = provider.get_show_images(metadata_id=82728)
    pprint.pprint(images)

def test_get_season():
    provider = ThemoviedbProvider()
    season = provider.get_season_info(show_metadata_id=82728,season_order=2)
    pprint.pprint(season)
    images = provider.get_season_images(show_metadata_id=82728,season_order=2)
    pprint.pprint(images)

def test_get_episode():
    provider = ThemoviedbProvider()
    season = provider.get_episode_info(show_metadata_id=82728,season_order=2,episode_order=10)
    pprint.pprint(season)
    images = provider.get_episode_images(show_metadata_id=82728,season_order=2,episode_order=10)
    pprint.pprint(images)

def test_to_snowstream_movie():
    provider = ThemoviedbProvider()
    movie = provider.get_movie_info(metadata_id=431580)
    nfo_dict = provider.to_snowstream_movie(movie)
    import pprint
    pprint.pprint(nfo_dict)

def test_to_snowstream_show():
    provider = ThemoviedbProvider()
    show = provider.get_show_info(metadata_id=82728)
    nfo_dict = provider.to_snowstream_show(show)
    import pprint
    pprint.pprint(nfo_dict)

def test_to_snowstream_season():
    provider = ThemoviedbProvider()
    show = provider.get_season_info(show_metadata_id=82728,season_order=2)
    nfo_dict = provider.to_snowstream_season(show)
    import pprint
    pprint.pprint(nfo_dict)

def test_to_snowstream_episode():
    provider = ThemoviedbProvider()
    episode = provider.get_episode_info(show_metadata_id=82728,season_order=2, episode_order=4)
    nfo_dict = provider.to_snowstream_episodes([episode])
    import pprint
    pprint.pprint(nfo_dict)

test_to_snowstream_episode()
