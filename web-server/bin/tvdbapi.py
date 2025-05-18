import tvdb_v4_official
from settings import config
import json
from log import log

IMAGE_KINDS = {

}

# To run use
# `python -m bin.tvdbapi.py`

tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)
artwork_types = tvdb_client.get_artwork_types()
import pprint
pprint.pprint(artwork_types)