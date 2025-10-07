from log import log
from message.handler.update_media.media_updater import MediaUpdater
import os
import snow_media.image
import json
from db import db

class ShowEpisode(MediaUpdater):
    def __init__(self, job_id, scope):
        super().__init__(job_id,"ShowEpisode",scope)
        db.op.update_job(job_id=self.job_id, message=f"Updating media for episode {scope.target_id}")
        self.media_provider = scope.get_show_media_provider()
        self.show_episode_id = scope.target_id
        self.show_metadata_id = scope.metadata_id
        self.show_episode = self.db.op.get_show_episode_by_id(ticket=self.ticket,episode_id=self.show_episode_id)
        self.episode_video_file = self.show_episode.video_files[0]

    def has_nfo(self):
        return len(self.show_episode.metadata_files) > 0

    def has_images(self):
        return os.path.exists(self.get_image_path())

    def read_local_info(self):
        if self.scope.extract_only:
            return
        if self.has_nfo():
            self.episode_nfo_file = self.show_episode.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.episode_nfo_file.xml_content)
        else:
            local_path = self.nfo.video_path_to_nfo_path(video_path=self.episode_video_file.local_path)
            self.episode_nfo_file = self.FileStub()
            self.episode_nfo_file.local_path = local_path
            self.local_nfo_dict = {}

    def read_remote_info(self):
        if self.scope.extract_only:
            return
        if self.metadata:
            return self.metadata
        if self.show_episode.episode_end_order_counter:
            infos = []
            for ii in range(self.show_episode.episode_order_counter,self.show_episode.episode_end_order_counter+1):
                info = self.media_provider.get_episode_info(
                    show_metadata_id=self.show_metadata_id,
                    season_order=self.show_episode.season.season_order_counter,
                    episode_order=ii
                )
                infos.append(info)
            self.metadata = self.media_provider.to_snowstream_episodes(infos)
        else:
            info = self.media_provider.get_episode_info(
                show_metadata_id=self.show_metadata_id,
                season_order=self.show_episode.season.season_order_counter,
                episode_order=self.show_episode.episode_order_counter
            )
            self.metadata = self.media_provider.to_snowstream_episodes([info])
        return self.metadata

    def merge_remote_into_local(self):
        if self.scope.extract_only:
            return
        self.read_remote_info()
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        info = self.metadata
        if 'tmdbid' in self.local_nfo_dict and not info['tmdbid']:
            info['tmdbid'] = self.local_nfo_dict['tmdbid']
        if 'tvdbid' in self.local_nfo_dict and not info['tvdbid']:
            info['tvdbid'] = self.local_nfo_dict['tvdbid']
        self.new_nfo_xml = self.nfo.show_episode_to_xml(
            season=info['season'],
            episode=info['episode'],
            title=info['name'],
            plot=info['overview'],
            tvdbid=info['tvdbid'],
            tmdbid=info['tmdbid'],
            aired=info['aired'],
            year=info['year'],
            end_episode=self.show_episode.episode_end_order_counter,
            tags=tags
        )

        if self.show_episode.name != info['name']:
            self.db.op.update_show_episode_name(
                show_episode_id=self.show_episode.id,
                name=info['name']
            )

    def save_info_to_local(self):
        if self.scope.extract_only:
            local_path = self.nfo.video_path_to_nfo_path(video_path=self.episode_video_file.local_path)
            local_xml = self.nfo.show_episode_to_xml(
                season=self.show_episode.season.season_order_counter,
                episode=self.show_episode.episode_order_counter,
                title=self.show_episode.name,
                end_episode=self.show_episode.episode_end_order_counter,
            )
            self.nfo.save_xml_as_nfo(nfo_path=local_path,nfo_xml=local_xml)
            metadata_file = db.op.get_metadata_file_by_path(local_path=local_path)
            if not metadata_file:
                metadata_file = db.op.create_metadata_file(
                    self.show_episode.season.show.shelf.id,
                    kind='episode_info',
                    local_path=local_path,
                    xml_content=local_xml)
                self.db.op.create_show_episode_metadata_file(
                    show_episode_id=self.show_episode.id,
                    metadata_file_id=metadata_file.id
                )
            else:
                db.op.update_metadata_file_content(metadata_file_id=metadata_file.id,xml_content=local_xml)
        else:
            self.nfo.save_xml_as_nfo(nfo_path=self.episode_nfo_file.local_path, nfo_xml=self.new_nfo_xml)
            if self.episode_nfo_file.id:
                self.db.op.update_metadata_file_content(self.episode_nfo_file.id, xml_content=self.new_nfo_xml)
            else:
                self.episode_nfo_file = self.db.op.create_metadata_file(
                    shelf_id=self.show_episode.season.show.shelf.id,
                    kind="episode_info",
                    local_path=self.episode_nfo_file.local_path,
                    xml_content=self.new_nfo_xml
                )
                self.db.op.create_show_episode_metadata_file(
                    show_episode_id=self.show_episode.id,
                    metadata_file_id=self.episode_nfo_file.id
                )

    def get_image_path(self):
        return os.path.splitext(self.episode_video_file.local_path)[0]+".jpg"

    def take_screencap(self,local_path:str):
        info = json.loads(self.show_episode.video_files[0].snowstream_info_json)
        snow_media.image.extract_screencap(
            video_path=self.show_episode.video_files[0].local_path,
            duration_seconds=info['duration_seconds'],
            output_path=local_path
        )
        db.op.update_job(job_id=self.job_id, message=f"Took a screencap from {self.show_episode.name} to {local_path}")
        snow_media.image.create_thumbnail(local_path=local_path,force_overwrite=True)

    # Legacy images are
    # episode-name.jpg
    # metadata/episode-name.jpg
    def download_images(self):
        local_path = self.get_image_path()
        if self.scope.extract_only:
            self.take_screencap(local_path=local_path)
        else:
            self.read_remote_info()
            images = self.media_provider.get_episode_images(
                show_metadata_id=self.show_metadata_id,
                season_order=self.show_episode.season.season_order_counter,
                episode_order=self.show_episode.episode_order_counter
            )
            if not images or not self.download_image(image_url=images['screencap'],local_path=local_path):
                if not os.path.exists(local_path):
                    self.take_screencap(local_path=local_path)
        if not self.db.op.get_image_file_by_path(local_path=local_path):
            image_file = self.db.op.create_image_file(
                shelf_id=self.show_episode.season.show.shelf.id,
                kind='episode_screencap',
                local_path=local_path
            )
            self.db.op.create_show_episode_image_file(
                show_episode_id=self.show_episode.id,
                image_file_id=image_file.id
            )