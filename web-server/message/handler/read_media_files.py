from log import log
from db import db

from lxml import etree

def handle(job_id, message_payload):
    log.info(f"[WORKER] Handling a read_media_files job")
    shelves = db.op.get_shelf_list()
    results = {}
    handlers = []
    for shelf in shelves:
        log.info(f"Reading media for shelf [{shelf.name}->{shelf.kind}]")
        metadata_files = db.op.get_metadata_file_list()
        for metadata_file in metadata_files:
            with open(metadata_file.path,'r') as read_handle:
                metadata_xml = etree.fromstring(bytes(read_handle.read(), encoding="utf8"))
                for top_node in metadata_xml:
                    if "tag" in top_node.tag and ':' in top_node.text:
                        print(f'{metadata_file.path} - {top_node.text}')

    return True
