import tvdb_v4_official
from settings import config
import json
from log import log

IMAGE_KINDS = {

}

# To run use
# `python -m bin.tmdbapi`

def get_artwork_types():
    tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)
    artwork_types = tvdb_client.get_artwork_types()
    import pprint
    pprint.pprint(artwork_types)

def test_search():
    tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)
    search_results = tvdb_client.search(
        query="Abominable",
        year=2019,
        type="movie",
        language="eng"
    )
    import pprint
    pprint.pprint(search_results)

test_search()