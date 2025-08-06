from message.handler.update_media.media_updater import MediaUpdater
import os
from db import db

class Movie(MediaUpdater):
    def __init__(self,job_id,scope):
        super().__init__(job_id, "Movie",scope)
        db.op.update_job(job_id=self.job_id, message=f"Updating media for movie {scope.target_id}")
        self.media_provider = scope.get_movie_media_provider()
        self.movie_id = scope.target_id
        self.metadata_id = scope.metadata_id
        self.movie = self.db.op.get_movie_by_id(ticket=self.ticket,movie_id=self.movie_id)

    def has_nfo(self):
        return len(self.movie.metadata_files) > 0

    def has_images(self):
        return os.path.exists(self.get_image_path())

    def read_local_info(self):
        if self.has_nfo():
            self.movie_nfo_file = self.movie.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.movie_nfo_file.xml_content)
        else:
            local_path = self.nfo.video_path_to_nfo_path(video_path=self.movie.video_files[0].local_path)
            self.movie_nfo_file = self.FileStub()
            self.movie_nfo_file.local_path = local_path
            self.local_nfo_dict = {}
        return self.local_nfo_dict

    def read_remote_info(self):
        self.metadata = self.media_provider.get_movie_info(metadata_id=self.metadata_id)
        self.metadata = self.media_provider.to_snowstream_movie(metadata=self.metadata)
        return self.metadata

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        if 'tmdbid' in self.local_nfo_dict and not self.metadata['tmdbid']:
            self.metadata['tmdbid'] = self.local_nfo_dict['tmdbid']
        if 'tvdbid' in self.local_nfo_dict and not self.metadata['tvdbid']:
            self.metadata['tvdbid'] = self.local_nfo_dict['tvdbid']
        self.new_nfo_xml = self.nfo.movie_to_xml(
            title=self.metadata['name'],
            tagline=self.metadata['tagline'],
            plot=self.metadata['plot'],
            release_date=self.metadata['release_date'],
            year=self.metadata['year'] if 'year' in self.metadata else None,
            tvdbid=self.metadata['tvdbid'],
            tmdbid=self.metadata['tmdbid'],
            tags=tags
        )

    def save_info_to_local(self):
        self.nfo.save_xml_as_nfo(nfo_path=self.movie_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        if self.movie_nfo_file.id:
            self.db.op.update_metadata_file_content(self.movie_nfo_file.id, xml_content=self.new_nfo_xml)
        else:
            self.movie_nfo_file = self.db.op.create_metadata_file(
                shelf_id=self.movie.shelf.id,
                kind='movie_main_feature_info',
                local_path=self.movie_nfo_file.local_path,
                xml_content=self.new_nfo_xml
            )
            self.db.op.create_movie_metadata_file(movie_id=self.movie.id,metadata_file_id=self.movie_nfo_file.id)

    def get_image_path(self):
        return os.path.join(self.movie.directory,'folder.jpg')

    # Legacy images
    # backgroup.jpg
    # logo.png
    # folder.jpg
    # video_file_name.jpg
    def download_images(self):
        images = self.media_provider.get_movie_images(metadata_id=self.metadata_id)
        if not images:
            return False
        local_path = os.path.join(self.movie.directory,'folder.jpg')
        if self.download_image(image_url=images['poster'],local_path=local_path):
            if not self.db.op.get_image_file_by_path(local_path=local_path):
                image_file = self.db.op.create_image_file(
                    shelf_id=self.movie.shelf.id,
                    kind='movie_main_feature_poster',
                    local_path=local_path
                )
                self.db.op.create_movie_image_file(movie_id=self.movie.id,image_file_id=image_file.id)