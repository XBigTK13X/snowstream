from message.handler.update_media.media_updater import MediaUpdater
from message.handler.child_job import create_child_job
import os

class Show(MediaUpdater):
    def __init__(self,scope):
        super().__init__("Show",scope)
        self.log.info(f"Updating media for show {scope.target_id}")
        self.show_id = scope.target_id
        self.metadata_id = scope.metadata_id

    def read_local_info(self):
        self.show = self.db.op.get_show_by_id(ticket=self.ticket,show_id=self.show_id)
        if not self.show:
            return None
        if len(self.show.metadata_files) > 0:
            self.show_nfo_file = self.show.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.show_nfo_file.xml_content)
        else:
            local_path = self.nfo.show_directory_to_nfo_path(show_directory=self.show.directory)
            self.show_nfo_file = self.FileStub()
            self.show_nfo_file.local_path = local_path
            self.local_nfo_dict = {}

        return self.local_nfo_dict

    def read_remote_info(self):
        self.metadata = self.media_provider.get_show_info(metadata_id=self.metadata_id)
        self.metadata = self.media_provider.to_snowstream_show(metadata=self.metadata)
        return self.metadata

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        if 'tmdbid' in self.local_nfo_dict and not self.metadata['tmdbid']:
            self.metadata['tmdbid'] = self.local_nfo_dict['tmdbid']
        if 'tvdbid' in self.local_nfo_dict and not self.metadata['tvdbid']:
            self.metadata['tvdbid'] = self.local_nfo_dict['tvdbid']
        self.new_nfo_xml = self.nfo.show_to_xml(
            title=self.metadata['name'],
            year=self.metadata['year'],
            release_date=self.metadata['release_date'],
            plot=self.metadata['overview'],
            tvdbid=self.metadata['tvdbid'],
            tmdbid=self.metadata['tmdbid'],
            tags=tags
        )

    def save_info_to_local(self):
        self.nfo.save_xml_as_nfo(nfo_path=self.show_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
        if self.show_nfo_file.id:
            self.db.op.update_metadata_file_content(self.show_nfo_file.id, xml_content=self.new_nfo_xml)
        else:
            self.show_nfo_file = self.db.op.create_metadata_file(
                shelf_id=self.show.shelf.id,
                kind='show_info',
                local_path=self.show_nfo_file.local_path,
                xml_content=self.new_nfo_xml
            )
            self.db.op.create_show_metadata_file(show_id=self.show.id,metadata_file_id=self.show_nfo_file.id)

    # Legacy images are
    # banner.jpg
    # backdrop.jpg
    # folder.jpeg
    # logo.png
    # landscape.jpg
    def download_images(self):
        images = self.media_provider.get_show_images(metadata_id=self.metadata_id)
        if not images:
            return False
        local_path = os.path.join(self.show.directory,'poster.jpg')
        if self.download_image(image_url=images['poster'],local_path=local_path):
            if not self.db.op.get_image_file_by_path(local_path=local_path):
                image_file = self.db.op.create_image_file(
                    shelf_id=self.show.shelf.id,
                    kind="show_poster",
                    local_path=local_path
                )
                self.db.op.create_show_image_file(show_id=self.show.id,image_file_id=image_file.id)

    def schedule_subjobs(self,update_images:bool,update_metadata:bool):
        for season in self.show.seasons:
            create_child_job(name='update_media_files',payload={
                'metadata_id': self.metadata_id,
                'target_kind': 'season',
                'target_id': season.id,
                'season_order': season.season_order_counter,
                'update_images': update_images,
                'update_metadata': update_metadata,
                'is_subjob': True
            })