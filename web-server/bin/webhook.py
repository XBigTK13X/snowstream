import requests

web_api_url = 'http://192.168.101.10:8000/api'

auth_headers = {
    'apikey': 'scanner',
}

def test_sonarr_hook_with_id():
    print("Test the sonarr hook")
    print(requests.post(
        f'{web_api_url}/hook/sonarr',
        headers=auth_headers,
        json={
            'series':{
                'path': '/mnt/j-media/tv/cartoon/b/Batman - The Animated Series',
                'tvdbId': 76168
            }
        }
    ).text)

def test_sonarr_hook_no_id():
    print("Test the sonarr hook")
    print(requests.post(
        f'{web_api_url}/hook/sonarr',
        headers=auth_headers,
        json={
            'series':{
                'path': '/mnt/j-media/tv/cartoon/b/Batman - The Animated Series'
            }
        }
    ).text)

def test_radarr_hook_with_id():
    print("Test the radarr hook")
    print(requests.post(
        f'{web_api_url}/hook/radarr',
        headers=auth_headers,
        json={
            'movie':{
                'folderPath': '/mnt/m-media/movie/m/Master and Commander - The Far Side of the World (2003)',
                'tmdbId':8619
            }
        }
    ).text)

def test_radarr_hook_no_id():
    print("Test the radarr hook")
    print(requests.post(
        f'{web_api_url}/hook/radarr',
        headers=auth_headers,
        json={
            'movie':{
                'folderPath': '/mnt/m-media/movie/m/Master and Commander - The Far Side of the World (2003)'
            }
        }
    ).text)

test_radarr_hook_with_id()