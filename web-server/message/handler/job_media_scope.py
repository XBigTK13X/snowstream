def parse(input, key):
    return input[key] if key in input else None

class JobMediaScope:
    def __init__(self, raw_job_input:dict):
        self.target_kind = parse(raw_job_input,'target_kind')
        self.target_id = parse(raw_job_input,'target_id')
        self.metadata_id = parse(raw_job_input,'metadata_id')
        self.season_order = parse(raw_job_input,'season_order')
        self.episode_order = parse(raw_job_input,'episode_order')
        self.update_images = parse(raw_job_input,'update_images')
        self.update_metadata = parse(raw_job_input,'update_metadata')
        self.is_subjob = parse(raw_job_input,'is_subjob')

    def is_unscoped(self):
        return self.target_kind == None

    def is_shelf(self):
        return self.target_kind == 'shelf'

    def is_movie(self):
        return self.target_kind == 'movie'

    def is_show(self):
        return self.target_kind == 'show'

    def is_season(self):
        return self.target_kind == 'season'

    def is_episode(self):
        return self.target_kind == 'episode'