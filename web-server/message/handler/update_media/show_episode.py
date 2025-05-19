import message.handler.update_media.base_handler as base

class ShowEpisode(base.BaseHandler):
    def __init__(self, metadata_id:int,show_episode_id:int,season_order:int,episode_order:int):
        super().__init__("ShowEpisode")
        self.show_episode_id = show_episode_id
        self.show_metadata_id = metadata_id
        self.season_order = season_order
        self.episode_order = episode_order

    def read_local_info(self):
        self.show_episode = self.db.op.get_show_episode_by_id(ticket=self.ticket,episode_id=self.show_episode_id)
        if not self.show_episode:
            return None
        if not self.show_episode.metadata_files:
            return None
        self.episode_nfo_file = self.show_episode.metadata_files[0]
        self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.episode_nfo_file.xml_content)
        return self.local_nfo_dict

    def read_remote_info(self):
        self.tvdb_info = self.media_provider.get_episode_info(
            show_metadata_id=self.show_metadata_id,
            season_order=self.season_order,
            episode_order=self.episode_order
        )
        return self.tvdb_info

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        self.new_nfo_xml = self.nfo.show_episode_to_xml(
            season=self.tvdb_info['seasonNumber'],
            episode=self.tvdb_info['number'],
            title=self.tvdb_info['name'],
            plot=self.tvdb_info['overview'],
            tvdbid=self.tvdb_info['id'],
            aired=self.tvdb_info['aired'],
            year=self.tvdb_info['year'],
            tags=tags
        )

    def save_info_to_local(self):
        self.nfo.save_xml_as_nfo(nfo_path=self.episode_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        self.db.op.update_metadata_file_content(self.episode_nfo_file.id, xml_content=self.new_nfo_xml)

    # Legacy images are
    # episode-name.jpg
    # metadata/episode-name.jpg
    def download_images(self):
        images = self.media_provider.get_episode_images(
            show_metadata_id=self.show_metadata_id,
            season_order=self.season_order,
            episode_order=self.episode_order
        )
        import pprint
        pprint.pprint(images)