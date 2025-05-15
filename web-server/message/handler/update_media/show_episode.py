import message.handler.update_media.base_handler as base
import nfo
from db import db

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
        self.local_nfo_dict = nfo.nfo_xml_to_dict(self.episode_nfo_file.xml_content)
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
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = self.local_nfo_dict['episodedetails']['tag']
        self.new_nfo_xml = nfo.show_episode_to_xml(
            season=self.tvdb_info['seasonNumber'],
            episode=self.tvdb_info['number'],
            title=self.tvdb_info['name'],
            plot=self.tvdb_info['plot'],
            tvdbid=self.metadata_id,
            aired=self.tvdb_info['aired'],
            year=self.tvdb_info['year'],
            tags=tags
        )

    def save_info_to_local(self):
        nfo.save_xml_as_nfo(nfo_path=self.episode_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        db.op.update_metadata_file_content(self.episode_nfo_file.id, xml_content=self.new_nfo_xml)
