from message.handler.update_media.media_updater import MediaUpdater
import os
import ffmpeg
import magick
import json

class ShowEpisode(MediaUpdater):
    def __init__(self, scope):
        super().__init__("ShowEpisode",scope)
        self.log.info(f"Updating media for episode {scope.target_id}")
        self.show_episode_id = scope.target_id
        self.show_metadata_id = scope.metadata_id
        self.season_order = scope.season_order
        self.episode_order = scope.episode_order

    def read_local_info(self):
        self.show_episode = self.db.op.get_show_episode_by_id(ticket=self.ticket,episode_id=self.show_episode_id)
        if not self.show_episode:
            return None
        self.episode_video_file = self.show_episode.video_files[0]
        if len(self.show_episode.metadata_files) > 0:
            self.episode_nfo_file = self.show_episode.metadata_files[0]
            self.local_nfo_dict = self.nfo.nfo_xml_to_dict(self.episode_nfo_file.xml_content)
        else:
            local_path = self.nfo.video_path_to_nfo_path(video_path=self.episode_video_file.local_path)
            self.episode_nfo_file = self.FileStub()
            self.episode_nfo_file.local_path = local_path
            self.local_nfo_dict = {}
        return self.local_nfo_dict

    def read_remote_info(self):
        if self.show_episode.episode_end_order_counter:
            self.metadata = []
            for ii in range(self.show_episode.episode_order_counter,self.show_episode.episode_end_order_counter+1):
                info = self.media_provider.get_episode_info(
                    show_metadata_id=self.show_metadata_id,
                    season_order=self.season_order,
                    episode_order=ii
                )
                self.metadata.append(self.media_provider.to_snowstream_episodes(info))
        else:
            info = self.media_provider.get_episode_info(
                show_metadata_id=self.show_metadata_id,
                season_order=self.season_order,
                episode_order=self.episode_order
            )
            self.metadata = [self.media_provider.to_snowstream_episodes(info)]
        return self.metadata

    def merge_remote_into_local(self):
        tags = None
        if self.local_nfo_dict and 'tag' in self.local_nfo_dict:
            tags = [xx for xx in self.local_nfo_dict['tag'] if ':' in xx]
        info = self.metadata[0]

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

    # Legacy images are
    # episode-name.jpg
    # metadata/episode-name.jpg
    def download_images(self):
        images = self.media_provider.get_episode_images(
            show_metadata_id=self.show_metadata_id,
            season_order=self.season_order,
            episode_order=self.episode_order
        )
        local_path = os.path.splitext(self.episode_video_file.local_path)[0]+".jpg"
        if not images or not self.download_image(image_url=images['screencap'],local_path=local_path):
            if not os.path.exists(local_path):
                ffprobe = json.loads(self.show_episode.video_files[0].ffprobe_pruned_json)
                ffmpeg.extract_screencap(
                    video_path=self.show_episode.video_files[0].local_path,
                    duration_seconds=ffprobe['duration_seconds'],
                    output_path=local_path
                )
                self.log.info(f"Took a screencap from {self.show_episode.name} to {local_path}")
                magick.create_thumbnail(local_path=local_path,force_overwrite=True)
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