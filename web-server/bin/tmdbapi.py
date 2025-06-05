import tvdb_v4_official
from settings import config
import json
from log import log

from themoviedb import TMDb

# To run use
# `python -m bin.tmdbapi`

def get_artwork_types():
    tvdb_client = TMDb(key=config.themoviedb_api_key, language="EN", region="US")
    artwork_types = tvdb_client.search().movies(query="A")
    import pprint
    pprint.pprint(artwork_types)

def test_search():
    tvdb_client = TMDb(key=config.themoviedb_api_key, language="EN", region="US")
    search_results = tvdb_client.search().movies(query="Abominable", year=2019)
    import pprint
    pprint.pprint(search_results)

test_search()