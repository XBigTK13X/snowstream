import message.handler.update_media.base_handler as base
import xmltodict

class ShowEpisode(base.BaseHandler):
    def __init__(self, show_episode_id:int):
        super().__init__("ShowEpisode")
        self.show_episode_id = show_episode_id

    def read_local_info(self):
        self.show_episode = self.db.op.get_show_episode_by_id(ticket=self.ticket,episode_id=self.show_episode_id)
        if not self.show_episode:
            return None
        self.seasonOrder = self.show_episode.season.season_order_counter
        self.episodeOrder = self.show_episode.episode_order_counter
        if not self.show_episode.metadata_files:
            return None
        self.episode_nfo_file = self.show_episode.metadata_files[0]
        with open(self.episode_nfo_file.local_path,'r') as read_handle:
            self.local_nfo_dict = xmltodict.parse(read_handle.read())
        return self.local_nfo_dict

    def read_remote_info(self, metadataId:int, seasonOrder:int, episodeOrder:int):
        self.metadata_id = metadataId
        self.tvdb_info = self.media_provider.get_episode_info(
            metadataId=metadataId,
            seasonOrder=self.seasonOrder,
            episodeOrder=self.episodeOrder
        )
        return self.tvdb_info

    def merge_remote_into_local(self):
        nfo_dict = {}
        nfo_dict['season'] = self.tvdb_info['seasonNumber']
        nfo_dict['episode'] = self.tvdb_info['number']
        nfo_dict['title'] = self.tvdb_info['name']
        if self.local_nfo_dict and 'episodedetails' in self.local_nfo_dict and 'tag' in self.local_nfo_dict['episodedetails']:
            nfo_dict['tag'] = self.local_nfo_dict['episodedetails']['tag']
        nfo_dict['plot'] = self.tvdb_info['overview']
        nfo_dict['tvdbid'] = self.metadata_id
        nfo_dict['aired'] = self.tvdb_info['aired']
        nfo_dict['year'] = self.tvdb_info['year']

        self.new_nfo_dict = {'episodedetails':nfo_dict}
        self.new_nfo_xml = xmltodict.unparse(self.new_nfo_dict,pretty=True)

    def save_info_to_local(self):
        with open(self.episode_nfo_file.local_path,'w',encoding='utf-8') as write_handle:
            write_handle.write(self.new_nfo_xml)
