import message.handler.update_media.base_handler as base

class Show(base.BaseHandler):
    def __init__(self,metadata_id:int,show_id:int):
        super().__init__("Show")
        self.show_id = show_id
        self.metadata_id = metadata_id

    def read_local_info(self):
        self.show = self.db.op.get_show_by_id(ticket=self.ticket,show_id=self.show_id)
        self.show_nfo_file = self.show.metadata_files[0]
        self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.show_nfo_file.xml_content)
        return self.local_nfo_dict

    def read_remote_info(self):
        self.tvdb_info = self.media_provider.get_show_info(metadata_id=self.metadata_id)
        return self.tvdb_info

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        self.new_nfo_xml = self.nfo.show_to_xml(
            title = self.tvdb_info['tvdb_translation']['name'],
            year = self.tvdb_info['year'],
            release_date=self.tvdb_info['firstAired'],
            plot=self.tvdb_info['tvdb_translation']['overview'],
            tvdbid=self.tvdb_info['id'],
            tags=tags
        )

    def save_info_to_local(self):
        self.nfo.save_xml_as_nfo(nfo_path=self.show_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        self.db.op.update_metadata_file_content(self.show_nfo_file.id, xml_content=self.new_nfo_xml)

    def schedule_subjobs(self):
        for season in self.show.seasons:
            self.make_job(name='update_media_files',payload={
                'metadata_id': self.metadata_id,
                'target_scope': 'season',
                'target_id': season.id,
                'season_order': season.season_order_counter,
            })