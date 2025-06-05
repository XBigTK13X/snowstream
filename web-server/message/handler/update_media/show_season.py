from message.handler.update_media.media_updater import MediaUpdater
from message.handler.child_job import create_child_job
import os

class ShowSeason(MediaUpdater):
    def __init__(self, scope):
        super().__init__("ShowSeason",scope)
        self.log.info(f"Updating media for season {scope.target_id}")
        self.show_season_id = scope.target_id
        self.metadata_id = scope.metadata_id
        self.season_order = scope.season_order
        self.is_subjob = scope.is_subjob

    def read_local_info(self):
        self.show_season = self.db.op.get_show_season_by_id(ticket=self.ticket,season_id=self.show_season_id)
        if not self.show_season:
            return None
        self.episodes = self.db.op.get_show_episode_list_by_season(ticket=self.ticket,show_season_id=self.show_season_id)
        if not self.episodes:
            return None
        if len(self.show_season.metadata_files) > 0:
            self.season_nfo_file = self.show_season.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.season_nfo_file.xml_content)
        else:
            local_path = self.nfo.season_directory_to_nfo_path(season_directory=self.show_season.directory)
            self.season_nfo_file = self.FileStub()
            self.season_nfo_file.local_path = local_path
            self.local_nfo_dict = {}
        return self.local_nfo_dict

    def read_remote_info(self):
        self.metadata = self.media_provider.get_season_info(show_metadata_id=self.metadata_id, season_order=self.season_order)
        self.metadata = self.metadata.to_snowstream_season(self.metadata)
        return self.metadata

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        self.new_nfo_xml = self.nfo.show_season_to_xml(
            title = self.show_season.name,
            year = self.metadata['year'],
            release_date=self.metadata['release_date'],
            season_order=self.season_order,
            tvdbid=self.metadata['tvdbid'],
            tmdbid=self.metadata['tmdbid'],
            tags=tags
        )

    def save_info_to_local(self):
        self.nfo.save_xml_as_nfo(nfo_path=self.season_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        if self.season_nfo_file.id:
            self.db.op.update_metadata_file_content(self.season_nfo_file.id, xml_content=self.new_nfo_xml)
        else:
            self.season_nfo_file = self.db.op.create_metadata_file(
                shelf_id=self.show_season.show.shelf.id,
                kind="season_info",
                local_path=self.season_nfo_file.local_path,
                xml_content=self.new_nfo_xml
            )
            self.db.op.create_show_season_metadata_file(
                show_season_id=self.show_season.id,
                metadata_file_id=self.season_nfo_file.id
            )

    # Legacy images are
    # poster.jpg
    def download_images(self):
        images = self.media_provider.get_season_images(metadata_id=self.metadata_id,season_order=self.season_order)
        local_path = os.path.join(self.show_season.directory,'poster.jpg')
        if not images:
            return False
        if self.download_image(image_url=images['poster'],local_path=local_path):
            if not self.db.op.get_image_file_by_path(local_path=local_path):
                image_file = self.db.op.create_image_file(
                    shelf_id=self.show_season.show.shelf.id,
                    kind='season_poster',
                    local_path=local_path
                )
                self.db.op.create_show_season_image_file(
                    show_season_id=self.show_season.id,
                    image_file_id=image_file.id
                )


    def schedule_subjobs(self,update_images:bool,update_metadata:bool):
        for episode in self.episodes:
            create_child_job(name='update_media_files',payload={
                'metadata_id': self.metadata_id,
                'target_kind': 'episode',
                'target_id': episode.id,
                'season_order': self.show_season.season_order_counter,
                'episode_order': episode.episode_order_counter,
                'update_images': update_images,
                'update_metadata': update_metadata,
                'is_subjob': True
            })
        if not self.is_subjob:
            create_child_job(name='scan_shelves_content',payload={
                    'metadata_id': self.metadata_id,
                    'target_kind': 'season',
                    'target_id': self.show_season_id,
                    'is_subjob': True
                })