class JobMediaScope:
    def __init__(self, raw_job_input:dict):
        self.job_input = raw_job_input
        self.target = raw_job_input['target_scope']
        self.target_id = raw_job_input['target_id']
        self.metadata_id = raw_job_input['metadata_id']
        self.season_order = raw_job_input['season_order'] if 'season_order' in raw_job_input else None
        self.episode_order = raw_job_input['episode_order'] if 'episode_order' in raw_job_input else None
        self.update_images = raw_job_input['update_images'] if 'update_images' in raw_job_input else False
        self.update_metadata = raw_job_input['update_metadata'] if 'update_metadata' in raw_job_input else False

    def is_shelf(self):
        return self.target == 'shelf'

    def is_movie(self):
        return self.target == 'movie'

    def is_show(self):
        return self.target == 'show'

    def is_season(self):
        return self.target == 'season'

    def is_episode(self):
        return self.target == 'episode'