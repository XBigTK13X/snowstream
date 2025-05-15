import message.handler.update_media.base_handler as base

class ShowSeason(base.BaseHandler):
    def __init__(self, show_season_id:int):
        super().__init__("ShowSeason")
        self.show_season_id = show_season_id

    def read_local_info(self):
        self.show_season = self.db.op.get_show_season_by_id(ticket=self.ticket,season_id=self.show_season_id)
        self.episodes = self.db.op.get_show_episode_list_by_season(ticket=self.ticket,show_season_id=self.show_season_id)

    def read_remote_info(self, metadata_id:int, season_order:int):
        self.metadata_id = metadata_id
        return self.media_provider.get_season_info(metadata_id=metadata_id, season_order=season_order)

    def schedule_subjobs(self):
        for episode in self.episodes:
            self.make_job(name='update_media_files',payload={
                'metadata_id': self.metadata_id,
                'target_scope': 'episode',
                'target_id': episode.id,
                'season_order': self.show_season.season_order_counter,
                'episode_order': episode.episode_order_counter
            })