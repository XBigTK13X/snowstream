from log import log
from db import db
import api_models as am

from lxml import etree

def handle(job_id, message_payload):
    log.info(f"[WORKER] Handling a read_media_files job")
    shelves = db.op.get_shelf_list()
    results = {}
    handlers = []
    for shelf in shelves:
        log.info(f"Reading media for shelf [{shelf.name}->{shelf.kind}]")
        metadata_files = db.op.get_metadata_file_list()
        defined_tag_ids = {}
        for metadata_file in metadata_files:
            with open(metadata_file.path,'r') as read_handle:
                metadata_xml = etree.fromstring(bytes(read_handle.read(), encoding="utf8"))
                for top_node in metadata_xml:
                    if "tag" in top_node.tag and ':' in top_node.text:
                        tag_name = top_node.text
                        if not tag_name in defined_tag_ids:
                            tag = db.op.get_tag_by_name(tag_name)
                            if tag == None:
                                tag = am.Tag(**{'name':tag_name})
                                tag = db.op.upsert_tag(tag)
                            defined_tag_ids[tag_name] = tag.id
                            print(f"Processed {tag.name} for the first time on {metadata_file.path}")
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
