import xmltodict
import os

def nfo_path_to_dict(nfo_path:str):
    with open(nfo_path,'r',encoding="utf-8") as read_handle:
        return nfo_xml_to_dict(xml=read_handle.read(),step_into_root=True)

def nfo_xml_to_dict(xml:str,step_into_root:bool=True):
    result = xml_dict = xmltodict.parse(xml,force_list="tag")
    if step_into_root:
        return xml_dict[next(iter(xml_dict))]
    return result

def nfo_dict_to_xml(nfo_dict:dict):
    return xmltodict.unparse(nfo_dict,pretty=True)

def save_dict_as_nfo(nfo_path:str, nfo_dict:dict):
    with open(nfo_path,'w',encoding='utf-8') as write_handle:
        xml_content = xmltodict.unparse(nfo_dict,pretty=True)
        write_handle.write(xml_content)

def save_xml_as_nfo(nfo_path: str, nfo_xml: str):
    with open(nfo_path,'w',encoding='utf-8') as write_handle:
        write_handle.write(nfo_xml)

def video_path_to_nfo_path(video_path:str):
    return os.path.splitext(video_path)[0]+".nfo"

def season_directory_to_nfo_path(season_directory:str):
    return os.path.join(season_directory,'season.nfo')

def show_directory_to_nfo_path(show_directory):
    return os.path.join(show_directory,'tvshow.nfo')

def movie_to_xml(
    title:str,
    plot:str,
    release_date:str,
    year:int,
    tagline:str=None,
    tvdbid:int=None,
    tmdbid:int=None,
    tags:list[str]=None
):
    nfo_dict = {
        'movie':{
            'title': title,
            'plot': plot,
            'releasedate': release_date,
            'year': year
        }
    }

    if tagline:
        nfo_dict['movie']['tagline'] = tagline

    if tvdbid:
        nfo_dict['movie']['tvdbid'] = tvdbid

    if tmdbid:
        nfo_dict['movie']['tmdbid'] = tmdbid

    if tags:
        nfo_dict['movie']['tag'] = tags

    return nfo_dict_to_xml(nfo_dict=nfo_dict)

def show_episode_to_xml(
    season:int,
    episode:int,
    title:str,
    plot:str=None,
    aired:str=None,
    year:int=None,
    end_episode:int=None,
    tvdbid:int=None,
    tmdbid:int=None,
    tags:list[str]=None,
):
    nfo_dict = {
        'episodedetails':{
            'season': season,
            'episode': episode,
            'title': title
        }
    }

    if plot:
        nfo_dict['episodedetails']['plot'] = plot

    if year:
        nfo_dict['episodedetails']['year'] = year

    if aired:
        nfo_dict['episodedetails']['aired'] = aired

    if end_episode:
        nfo_dict['episodedetails']['episodenumberend'] = end_episode

    if tvdbid:
        nfo_dict['episodedetails']['tvdbid'] = tvdbid

    if tmdbid:
        nfo_dict['episodedetails']['tmdbid'] = tmdbid

    if tags:
        nfo_dict['episodedetails']['tag'] = tags

    return nfo_dict_to_xml(nfo_dict=nfo_dict)

def show_season_to_xml(
    title: str,
    year: int,
    release_date: str,
    season_order: int,
    tvdbid: int=None,
    tmdbid: int=None,
    tags: list[str]=None
):
    nfo_dict = {
        'season': {
            'title': title,
            'year': year,
            'releasedate': release_date,
            'seasonnumber': season_order
        }
    }

    if tvdbid:
        nfo_dict['season']['tvdbid'] = tvdbid

    if tmdbid:
        nfo_dict['season']['tmdbid'] = tmdbid

    if tags:
        nfo_dict['season']['tag'] = tags

    return nfo_dict_to_xml(nfo_dict=nfo_dict)

def show_to_xml(
    title:str,
    plot:str,
    year:int,
    release_date:str,
    tvdbid:int=None,
    tmdbid:int=None,
    tags:list[str]=None
):
    nfo_dict = {
        'tvshow': {
            'title': title,
            'year': year,
            'plot': plot,
            'releasedate': release_date
        }
    }

    if tvdbid:
        nfo_dict['tvshow']['tvdbid'] = tvdbid

    if tmdbid:
        nfo_dict['tvshow']['tmdbid'] = tmdbid


    if tags:
        nfo_dict['tvshow']['tag'] = tags

    return nfo_dict_to_xml(nfo_dict=nfo_dict)