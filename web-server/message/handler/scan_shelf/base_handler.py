import os
from log import log

import mimetypes
mimetypes.init()

from typing import Callable

def get_file_kind(file_path):
    if file_path.endswith('.nfo'):
        return 'metadata'

    mime = mimetypes.guess_type(file_path)[0]

    if mime != None:
        mime = mime.split('/')[0]

        if 'video' in mime:
            return 'video'
        if 'image' in mime:
            return 'image'

    return 'unhandled'


class BaseHandler:
    def __init__(self, job_id, shelf):
        self.job_id = job_id
        self.shelf = shelf
        self.file_lookup = {
            'video': [],
            'image': [],
            'metadata': [],
            'unhandled': []
        }
        self.file_info_lookup = {
            'video': [],
            'image': [],
            'metadata': [],
        }
        self.batch_lookup = {}

    def get_files_in_directory(self):
        log.info(f"Scanning directory [{self.shelf.directory}]")
        file_count = 0
        for root, dirs, files in os.walk(self.shelf.directory):
            for shelf_file in files:
                file_path = os.path.join(root, shelf_file)
                file_count += 1
                self.file_lookup[get_file_kind(file_path)].append(file_path)
        log.info(f"Found [{file_count}] files to process")
        return True

    def ingest_files(self, kind:str, parser:Callable[[str], dict], identifier:Callable[[dict],str]):
        parsed_files = []
        for media_path in self.file_lookup[kind]:
            #log.info(f"Found a {kind} file [{media_path}]")
            media_info = parser(file_path=media_path)
            if media_info == None:
                #log.info(f"Wasn't able to parse {kind} info for [{media_path}]")
                continue
            media_info['kind'] = identifier(media_info)
            media_info['file_path'] = media_path
            parsed_files.append(media_info)
        log.info(f"Ingested info for ({len(parsed_files)}/{len(self.file_lookup[kind])}) parsed {kind} file paths")
        parsed_files = sorted(parsed_files, key=lambda x: x['file_path'])
        return parsed_files

    def organize(self):
        return True

    def ingest_videos(self):
        return True

    def ingest_images(self):
        return True

    def ingest_metadata(self):
        return True
