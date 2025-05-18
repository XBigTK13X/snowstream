import message.handler.update_media.base_handler as base

class Movie(base.BaseHandler):
    def __init__(self,metadata_id:int,movie_id:int):
        super().__init__("Movie")
        self.movie_id = movie_id
        self.metadata_id = metadata_id

    def read_local_info(self):
        self.movie = self.db.op.get_movie_by_id(ticket=self.ticket,movie_id=self.movie_id)
        if not self.movie:
            return None
        if not self.movie.metadata_files:
            return None
        self.movie_nfo_file = self.movie.metadata_files[0]
        self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.movie_nfo_file.xml_content)
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
        self.db.op.update_metadata_file_content(self.movie_nfo_file.id, xml_content=self.new_nfo_xml)

    def download_images(self):
        images = self.media_provider.get_movie_images(metadata_id=self.metadata_id)
        import pprint
        pprint.pprint(images)