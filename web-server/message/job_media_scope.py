from message.handler.update_media.provider.thetvdb_provider import ThetvdbProvider
from message.handler.update_media.provider.themoviedb_provider import ThemoviedbProvider

def parse(input, key):
    if not input:
        return None
    value = input[key] if key in input else None
    if value == None:
        return None
    if isinstance(value,str) and value.isnumeric():
        if '.' in value:
            return float(value)
        return int(value)
    return value

class JobMediaScope:
    def __init__(self, job_id:int, raw_job_input:dict):
        self.job_id = job_id
        self.input = raw_job_input
        self.target_kind = parse(raw_job_input,'target_kind')
        self.target_id = parse(raw_job_input,'target_id')
        self.target_directory = parse(raw_job_input,'target_directory')
        self.metadata_id = parse(raw_job_input,'metadata_id')
        self.metadata_source = parse(raw_job_input,'metadata_source')
        self.season_order = parse(raw_job_input,'season_order')
        self.episode_order = parse(raw_job_input,'episode_order')
        self.update_videos = parse(raw_job_input, 'update_videos')
        self.update_images = parse(raw_job_input,'update_images')
        self.update_metadata = parse(raw_job_input,'update_metadata')
        self.skip_existing = parse(raw_job_input,'skip_existing')
        self.extract_only = parse(raw_job_input,'extract_only')
        self.is_subjob = parse(raw_job_input,'is_subjob')
        self.spawn_subjob = parse(raw_job_input,'spawn_subjob')

    def is_unscoped(self):
        return (not self.target_kind or not self.target_id) and not self.target_directory

    def is_directory(self):
        return self.target_kind == 'directory' or ((self.target_kind == None or self.target_id == None) and self.target_directory != None)

    def is_stream_source(self):
        return self.target_kind == 'stream_source'

    def is_guide_source(self):
        return self.target_kind == 'guide_source'

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

    def is_keepsake(self):
        return self.target_kind == 'keepsake'

    def is_orphan(self):
        return self.target_kind == 'orphan'


    def get_movie_media_provider(self):
        if not self.metadata_source or 'themoviedb' in self.metadata_source:
            return ThemoviedbProvider(self.job_id,self.metadata_source)
        return ThetvdbProvider(self.job_id,self.metadata_source)

    def get_show_media_provider(self):
        if not self.metadata_source or 'thetvdb' in self.metadata_source:
            return ThetvdbProvider(self.job_id,self.metadata_source)
        return ThemoviedbProvider(self.job_id,self.metadata_source)

    def skip_existing_media(self):
        return self.skip_existing == True
