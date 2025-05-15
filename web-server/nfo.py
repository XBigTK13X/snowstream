import xmltodict

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
        xml_content = xmltodict.unparse(dict,pretty=True)
        write_handle.write(xml_content)

def save_xml_as_nfo(nfo_path: str, nfo_xml: str):
    with open(nfo_path,'w',encoding='utf-8') as write_handle:
        write_handle.write(nfo_xml)

def show_episode_to_xml(
    season:int,
    episode:int,
    title:str,
    plot:str,
    tvdbid:int,
    aired:str,
    year:int,
    tags:list[str]=None,
):
    nfo_dict = {
        'episodedetails':{
            'season': season,
            'episode': episode,
            'title': title,
            'plot': plot,
            'tvdbid': tvdbid,
            'aired': aired,
            'year': year
        }
    }

    if tags:
        nfo_dict['episodedetails']['tag'] = tags

    return nfo_dict_to_xml(nfo_dict=nfo_dict)