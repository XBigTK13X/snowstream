import tvdb_v4_official
from settings import config
import json
from log import log
import pprint
import requests
from message.handler.update_media.provider.thetvdb_provider import ThetvdbProvider

IMAGE_KINDS = {

}

SPONGEBOB = 75886

# To run use
# `python -m bin.tvdbapi`

tvdb_client = tvdb_v4_official.TVDB(config.thetvdb_api_key)


def get_artwork_types():
    artwork_types = tvdb_client.get_artwork_types()
    import pprint
    pprint.pprint(artwork_types)

def test_search():
    search_results = tvdb_client.search(
        query="Abominable",
        year=2019,
        type="movie",
        language="eng"
    )
    pprint.pprint(search_results)

def test_get_series_extended():
    global SPONGEBOG
    show = tvdb_client.get_series_extended(id=SPONGEBOB)
    pprint.pprint(show)

def test_get_alt_order_episodes_raw_api():
    global SPONGEBOG
    api_root = 'https://api4.thetvdb.com/v4'
    print("Testing episodes with api key")
    print(config.thetvdb_api_key)
    login_res = requests.post(f'{api_root}/login',
        json={'apikey':config.thetvdb_api_key}
    )
    login_json = login_res.json()
    print("Got response")
    pprint.pprint(login_json)
    auth_token = login_json['data']['token']
    print(auth_token)
    # at the moment, altdvd is broken
    # https://github.com/thetvdb/v4-api/issues/306
    # https://github.com/thetvdb/v4-api/issues/340
    episodes_url = f'{api_root}/series/{SPONGEBOB}/episodes/altdvd/eng?page=0&season=1'
    episodes_res = requests.get(
        episodes_url,
        headers={
            'Authorization': f'Bearer {auth_token}'
        }
    )
    episodes_json = episodes_res.json()
    pprint.pprint(episodes_json)

def test_get_alt_order_episodes():
    global SPONGEBOG
    provider = ThetvdbProvider(metadata_source="thetvdb--order_kind=alternate")
    episode = provider.get_episode_info(show_metadata_id=SPONGEBOB,season_order=2,episode_order=2)
    print("alternate order episode s2e2")
    pprint.pprint(episode,indent=4)
    provider = ThetvdbProvider()
    episode = provider.get_episode_info(show_metadata_id=SPONGEBOB,season_order=2,episode_order=2)
    print("default order episode s2e2")
    pprint.pprint(episode,indent=4)

test_get_alt_order_episodes()