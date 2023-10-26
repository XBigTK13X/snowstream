import os
from log import log

import mimetypes
mimetypes.init()


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

    def get_files_in_directory(self):
        for root, dirs, files in os.walk(self.shelf.directory):
            for shelf_file in files:
                file_path = os.path.join(root, shelf_file)
                self.file_lookup[get_file_kind(file_path)].append(file_path)
        return True

    def ingest_videos(self):
        return True

    def ingest_images(self):
        return True

    def ingest_metadata(self):
        return True
