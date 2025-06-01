from message.handler.update_media.media_updater import MediaUpdater
from message.handler.child_job import create_child_job
import os

class Movie(MediaUpdater):
    def __init__(self,scope):
        super().__init__("Movie")
        self.log.info(f"Updating media for movie {scope.target_id}")
        self.movie_id = scope.target_id
        self.metadata_id = scope.metadata_id

    def read_local_info(self):
        self.movie = self.db.op.get_movie_by_id(ticket=self.ticket,movie_id=self.movie_id)
        if not self.movie:
            return None
        if len(self.movie.metadata_files) > 0:
            self.movie_nfo_file = self.movie.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.movie_nfo_file.xml_content)
        else:
            local_path = self.nfo.video_path_to_nfo_path(video_path=self.movie.video_files[0].local_path)
            self.movie_nfo_file = self.FileStub()
            self.movie_nfo_file.local_path = local_path
            self.local_nfo_dict = {}

        return self.local_nfo_dict

    def read_remote_info(self):
        self.tvdb_info = self.media_provider.get_movie_info(
            metadata_id=self.metadata_id
        )
        return self.tvdb_info

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        tagline = None
        plot = None
        release_date = None
        if 'tvdb_translation' in self.tvdb_info:
            if 'tagline' in self.tvdb_info['tvdb_translation']:
                tagline = self.tvdb_info['tvdb_translation']['tagline']
            if 'overview' in self.tvdb_info['tvdb_translation']:
                plot = self.tvdb_info['tvdb_translation']['overview']
        if 'tvdb_extended' in self.tvdb_info:
            if 'first_release' in self.tvdb_info['tvdb_extended']:
                release_date = self.tvdb_info['tvdb_extended']['first_release']['date']
        self.new_nfo_xml = self.nfo.movie_to_xml(
            title=self.tvdb_info['name'],
            tagline=tagline,
            plot=plot,
            release_date=release_date,
            year=self.tvdb_info['year'],
            tvdbid=self.tvdb_info['id'],
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
                web_path = self.config.web_media_url + self.movie_nfo_file.local_path,
                network_path="",
                xml_content=self.new_nfo_xml)
            self.db.op.create_movie_metadata_file(movie_id=self.movie.id,metadata_file_id=self.movie_nfo_file.id)

    # Legacy images
    # backgroup.jpg
    # logo.png
    # folder.jpg
    def download_images(self):
        images = self.media_provider.get_movie_images(metadata_id=self.metadata_id)
        local_path = os.path.join(self.movie.directory,'folder.jpg')
        self.download_image(image_url=images['poster'],local_path=local_path)

    def schedule_subjobs(self,update_images:bool,update_metadata:bool):
        create_child_job(name='scan_shelves_content',payload={
            'metadata_id': self.metadata_id,
            'target_kind': 'movie',
            'target_id': self.movie_id,
            'is_subjob': True
        })