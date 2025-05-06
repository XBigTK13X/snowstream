from log import log
from db import db
import api_models as am

import xmltodict

def handle(job_id, message_payload):
    log.info(f"[WORKER] Handling a read_media_files job")
    shelves = db.op.get_shelf_list()
    results = {}
    handlers = []
    defined_tag_ids = {}
    printed = False
    for shelf in shelves:
        log.info(f"Reading media for shelf [{shelf.name}->{shelf.kind}]")
        metadata_files = db.op.get_metadata_file_list()
        for metadata_file in metadata_files:
            with open(metadata_file.local_path,'r') as read_handle:
                xml_dict = xmltodict.parse(read_handle.read(),force_list="tag")
                nfo_content = xml_dict[next(iter(xml_dict))]
                if not 'tag' in nfo_content:
                    continue
                for tag_name in nfo_content['tag']:
                    if not ':' in tag_name:
                        continue
                    if not tag_name in defined_tag_ids:
                        tag = db.op.get_tag_by_name(tag_name)
                        if tag == None:
                            tag = am.Tag(**{'name':tag_name})
                            tag = db.op.upsert_tag(tag)
                        defined_tag_ids[tag_name] = tag.id
                        log.info(f"Processed [{tag.name}] for the first time on {metadata_file.local_path}")
                    tag_id = defined_tag_ids[tag_name]
                    if metadata_file.movie != None:
                        db.op.upsert_movie_tag(metadata_file.movie.id,tag_id)
                    if metadata_file.show != None:
                        db.op.upsert_show_tag(metadata_file.show.id,tag_id)
                    if metadata_file.show_season != None:
                        db.op.upsert_show_season_tag(metadata_file.show_season.id,tag_id)
                    if metadata_file.show_episode != None:
                        db.op.upsert_show_episode_tag(metadata_file.show_episode.id,tag_id)

    return True
