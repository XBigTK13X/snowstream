import requests

web_api_url = 'http://192.168.101.10:8000/api'

auth_headers = {
    'apikey': 'scanner',
}

# print("Test the sonarr hook")
# print(requests.post(
#     f'{web_api_url}/hook/sonarr',
#     headers=auth_headers,
#     json={
#         'series':{
#             'path': '/mnt/j-media/tv/cartoon/b/Batman - The Animated Series'
#         }
#     }
# ).text)

print("Test the radarr hook")
print(requests.post(
    f'{web_api_url}/hook/radarr',
    headers=auth_headers,
    json={
        'movie':{
            'folderPath': '/mnt/m-media/movie/a/A Fish Called Wanda (1988)'
        }
    }
).text)