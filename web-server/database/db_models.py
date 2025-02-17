import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.ext.hybrid import hybrid_method
from typing import List

from database.sql_alchemy import BaseModel
# Reminder -> back_populates is necessary to avoid a bunch of warnings and subtle bugs

class User(BaseModel):
    __tablename__ = "snowstream_user"
    username = sa.Column(sa.Text, nullable=False)
    display_name = sa.Column(sa.Text, nullable=True)
    hashed_password = sa.Column(sa.Text, nullable=False)
    enabled = sa.Column(sa.Boolean)
    permissions = sa.Column(sa.Text)
    access_tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary="user_tag")
    access_shelves: sorm.Mapped[List["Shelf"]] = sorm.relationship(secondary="user_shelf")
    access_stream_sources: sorm.Mapped[List["StreamSource"]] = sorm.relationship(secondary="user_stream_source")

    def has_access_restrictions(self):
        return self.has_shelf_restrictions() or self.has_tag_restrictions() or self.has_stream_source_restrictions()
    
    def has_shelf_restrictions(self):
        return len(self.access_shelves) > 0

    def get_shelf_restrictions(self):
        if not self.has_shelf_restrictions():
            return None
        return [xx.id for xx in self.access_shelves]    
    
    def has_tag_restrictions(self):
        return len(self.access_tags) > 0

    def get_tag_restrictions(self):
        if not self.has_tag_restrictions():
            return None
        return [xx.id for xx in self.access_tags]    
    
    def has_stream_source_restrictions(self):
        return len(self.access_stream_sources) > 0
    
    def get_stream_source_restrictions(self):
        if not self.has_stream_source_restrictions():
            return None
        return [xx.id for xx in self.access_stream_sources]    

    def is_admin(self):
        return 'admin' in self.permissions

class UserTag(BaseModel):
    __tablename__ = "user_tag"
    user_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("snowstream_user.id"))
    tag_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("tag.id"))

class UserShelf(BaseModel):
    __tablename__ = "user_shelf"
    user_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("snowstream_user.id"))
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))

class UserStreamSource(BaseModel):
    __tablename__ = "user_stream_source"
    user_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("snowstream_user.id"))
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("stream_source.id"))

class ClientDevice(BaseModel):
    __tablename__ = "client_device"
    reported_name = sa.Column(sa.Text)
    display_name = sa.Column(sa.Text)
    device_kind = sa.Column(sa.Text)    

class ClientDeviceUser(BaseModel):
    __tablename__ = "client_device_user"
    user_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("snowstream_user.id"),nullable=False)
    client_device_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("client_device.id"),nullable=False)
    isolation_mode = sa.Column(sa.Text)
    last_connection = sa.Column(sa.DateTime)

class WatchProgress(BaseModel):
    __tablename__ = 'watch_progress'
    client_device_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("client_device_user.id"),nullable=False
    )
    show_episode_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("show_episode.id"),nullable=True
    )
    movie_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("movie.id"),nullable=True
    )
    streamable_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("streamable.id"),nullable=True
    )
    played_seconds = sa.Column(sa.Integer)
    duration_seconds = sa.Column(sa.Integer)

class WatchCount(BaseModel):
    __tablename__ = 'watch_count'
    client_device_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("client_device_user.id"),nullable=False
    )
    show_episode_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("show_episode.id"),nullable=True
    )
    movie_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("movie.id"),nullable=True
    )
    streamable_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("streamable.id"),nullable=True
    )
    amount = sa.Column(sa.Integer)    

class Watched(BaseModel):
    __tablename__ = 'watched'
    client_device_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("client_device_user.id"),nullable=False
    )
    show_episode_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("show_episode.id"),nullable=True
    )
    movie_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("movie.id"),nullable=True
    )
    streamable_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("streamable.id"),nullable=True
    )

class TranscodeSession(BaseModel):
    __tablename__ = 'transcode_session'
    client_device_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("client_device_user.id"),nullable=False
    )
    video_file_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("video_file.id"),nullable=True
    )
    streamable_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("streamable.id"),nullable=True
    )
    process_id = sa.Column(sa.Integer)
    transcode_directory = sa.Column(sa.Text)
    transcode_file = sa.Column(sa.Text)

class CachedText(BaseModel):
    __tablename__ = "cached_text"
    key = sa.Column(sa.Text)
    data = sa.Column(sa.Text)

class Job(BaseModel):
    __tablename__ = "job"
    kind = sa.Column(sa.Text)
    message = sa.Column(sa.Text)
    status = sa.Column(sa.Text)

class Tag(BaseModel):
    __tablename__ = "tag"
    name = sa.Column(sa.Text)
    movies: sorm.Mapped[List["Movie"]] = sorm.relationship(secondary="movie_tag",back_populates="tags")
    shows: sorm.Mapped[List["Show"]] = sorm.relationship(secondary="show_tag",back_populates="tags")
    show_seasons: sorm.Mapped[List["ShowSeason"]] = sorm.relationship(secondary="show_season_tag",back_populates="tags")
    show_episodes: sorm.Mapped[List["ShowEpisode"]] = sorm.relationship(secondary="show_episode_tag",back_populates="tags")

class ImageFile(BaseModel):
    __tablename__ = "image_file"
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))
    kind = sa.Column(sa.Text)
    path = sa.Column(sa.Text)
    movie: sorm.Mapped["Movie"] = sorm.relationship(secondary="movie_image_file")
    show_episode: sorm.Mapped["ShowEpisode"] = sorm.relationship(secondary="show_episode_image_file")
    show_season: sorm.Mapped["ShowSeason"] = sorm.relationship(secondary="show_season_image_file")
    show: sorm.Mapped["Show"] = sorm.relationship(secondary="show_image_file")

    @hybrid_method
    def set_web_path(self, path) -> str:
        self.web_path = path
        return self.web_path

class MetadataFile(BaseModel):
    __tablename__ = "metadata_file"
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))
    kind = sa.Column(sa.Text)
    path = sa.Column(sa.Text)
    movie: sorm.Mapped["Movie"] = sorm.relationship(secondary="movie_metadata_file")
    show_episode: sorm.Mapped["ShowEpisode"] = sorm.relationship(secondary="show_episode_metadata_file")
    show_season: sorm.Mapped["ShowSeason"] = sorm.relationship(secondary="show_season_metadata_file")
    show: sorm.Mapped["Show"] = sorm.relationship(secondary="show_metadata_file")

    @hybrid_method
    def set_web_path(self, path) -> str:
        self.web_path = path
        return self.web_path


class VideoFile(BaseModel):
    __tablename__ = "video_file"
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))
    kind = sa.Column(sa.Text)
    path = sa.Column(sa.Text)
    movie: sorm.Mapped["Movie"] = sorm.relationship(secondary="movie_video_file",back_populates="video_files")
    show_episode: sorm.Mapped["ShowEpisode"] = sorm.relationship(secondary="show_episode_video_file",back_populates="video_files")

    @hybrid_method
    def set_web_path(self, path) -> str:
        self.web_path = path
        return self.web_path

class Shelf(BaseModel):
    __tablename__ = "shelf"
    name = sa.Column(sa.Text)
    kind = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    direct_stream_url = sa.Column(sa.Text)
    movies: sorm.Mapped[List["Movie"]] = sorm.relationship(secondary="movie_shelf",back_populates="shelf")
    shows: sorm.Mapped[List["Show"]] = sorm.relationship(secondary="show_shelf",back_populates="shelf")

class Movie(BaseModel):
    __tablename__ = "movie"
    name = sa.Column(sa.Text)
    release_year = sa.Column(sa.Integer)
    tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary="movie_tag",back_populates="movies")
    video_files: sorm.Mapped[List["VideoFile"]] = sorm.relationship(secondary="movie_video_file",back_populates="movie")
    image_files: sorm.Mapped[List["ImageFile"]] = sorm.relationship(secondary="movie_image_file",back_populates="movie")
    metadata_files: sorm.Mapped[List["MetadataFile"]] = sorm.relationship(secondary="movie_metadata_file",back_populates="movie")
    shelf: sorm.Mapped["Shelf"] = sorm.relationship(secondary="movie_shelf")

    def convert_local_paths_to_web_paths(self, config):
        shelf_root = self.shelf.directory.split("/")
        shelf_root.pop()
        shelf_root = "/".join(shelf_root)
        for video_file in self.video_files:
            video_file.set_web_path(
                config.web_media_url + video_file.path
            )
        for image_file in self.image_files:
            image_file.set_web_path(
                config.web_media_url + image_file.path
            )
            if "poster" in image_file.kind:
                self.main_poster_image = image_file
        for metadata_file in self.image_files:
            metadata_file.set_web_path(
                config.web_media_url + metadata_file.path
            )


class MovieShelf(BaseModel):
    __tablename__ = "movie_shelf"
    movie_id = sa.Column(sa.Integer, sa.ForeignKey("movie.id"))
    shelf_id = sa.Column(sa.Integer, sa.ForeignKey("shelf.id"))


class MovieTag(BaseModel):
    __tablename__ = "movie_tag"
    movie_id = sa.Column(sa.Integer, sa.ForeignKey("movie.id"))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey("tag.id"))


class MovieImageFile(BaseModel):
    __tablename__ = "movie_image_file"
    movie_id = sa.Column(sa.Integer, sa.ForeignKey("movie.id"))
    image_file_id = sa.Column(sa.Integer, sa.ForeignKey("image_file.id"))


class MovieMetadataFile(BaseModel):
    __tablename__ = "movie_metadata_file"
    movie_id = sa.Column(sa.Integer, sa.ForeignKey("movie.id"))
    metadata_file_id = sa.Column(sa.Integer, sa.ForeignKey("metadata_file.id"))


class MovieVideoFile(BaseModel):
    __tablename__ = "movie_video_file"
    movie_id = sa.Column(sa.Integer, sa.ForeignKey("movie.id"))
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey("video_file.id"))


class Show(BaseModel):
    __tablename__ = "show"
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    shelf: sorm.Mapped["Shelf"] = sorm.relationship(secondary="show_shelf")
    seasons: sorm.Mapped[List["ShowSeason"]] = sorm.relationship(back_populates='show')
    image_files: sorm.Mapped[List["ImageFile"]] = sorm.relationship(secondary="show_image_file",back_populates="show")
    metadata_files: sorm.Mapped[List["MetadataFile"]] = sorm.relationship(secondary="show_metadata_file",back_populates="show")
    tags: sorm.Mapped[List['Tag']] = sorm.relationship(secondary="show_tag",back_populates="shows")

    def convert_local_paths_to_web_paths(self, config):
        shelf_root = self.shelf.directory.split("/")
        shelf_root.pop()
        shelf_root = "/".join(shelf_root)
        for image_file in self.image_files:
            image_file.set_web_path(
                config.web_media_url + image_file.path
            )
            if "poster" in image_file.kind:
                self.main_poster_image = image_file
        for metadata_file in self.metadata_files:
            metadata_file.set_web_path(
                config.web_media_url + metadata_file.path
            )

    tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary="show_tag")

class ShowShelf(BaseModel):
    __tablename__ = "show_shelf"
    show_id = sa.Column(sa.Integer, sa.ForeignKey("show.id"))
    shelf_id = sa.Column(sa.Integer, sa.ForeignKey("shelf.id"))

class ShowTag(BaseModel):
    __tablename__ = "show_tag"
    show_id = sa.Column(sa.Integer, sa.ForeignKey("show.id"))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey("tag.id"))


class ShowImageFile(BaseModel):
    __tablename__ = "show_image_file"
    show_id = sa.Column(sa.Integer, sa.ForeignKey("show.id"))
    image_file_id = sa.Column(sa.Integer, sa.ForeignKey("image_file.id"))


class ShowMetadataFile(BaseModel):
    __tablename__ = "show_metadata_file"
    show_id = sa.Column(sa.Integer, sa.ForeignKey("show.id"))
    metadata_file_id = sa.Column(sa.Integer, sa.ForeignKey("metadata_file.id"))


class ShowSeason(BaseModel):
    __tablename__ = "show_season"
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    season_order_counter = sa.Column(sa.Integer)
    show_id: sorm.Mapped[int] = sa.Column(sa.Integer, sa.ForeignKey("show.id"))
    show: sorm.Mapped["Show"] = sorm.relationship(back_populates="seasons")
    episodes: sorm.Mapped[List["ShowEpisode"]] = sorm.relationship(back_populates="season")
    image_files: sorm.Mapped[List["ImageFile"]] = sorm.relationship(secondary="show_season_image_file",back_populates="show_season")
    metadata_files: sorm.Mapped[List["MetadataFile"]] = sorm.relationship(secondary="show_season_metadata_file",back_populates="show_season")
    tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary="show_season_tag",back_populates="show_seasons")

    #TODO This was useful during development, but really only needs to be done once on ingest
    def convert_local_paths_to_web_paths(self, config):
        shelf_root = self.show.shelf.directory.split("/")
        shelf_root.pop()
        shelf_root = "/".join(shelf_root)
        for image_file in self.image_files:
            image_file.set_web_path(
                config.web_media_url + image_file.path
            )
            if "poster" in image_file.kind:
                self.main_poster_image = image_file
        for metadata_file in self.metadata_files:
            metadata_file.set_web_path(
                config.web_media_url + metadata_file.path
            )

class ShowSeasonTag(BaseModel):
    __tablename__ = "show_season_tag"
    show_season_id = sa.Column(sa.Integer, sa.ForeignKey("show_season.id"))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey("tag.id"))


class ShowSeasonImageFile(BaseModel):
    __tablename__ = "show_season_image_file"
    show_season_id = sa.Column(sa.Integer, sa.ForeignKey("show_season.id"))
    image_file_id = sa.Column(sa.Integer, sa.ForeignKey("image_file.id"))


class ShowSeasonMetadataFile(BaseModel):
    __tablename__ = "show_season_metadata_file"
    show_season_id = sa.Column(sa.Integer, sa.ForeignKey("show_season.id"))
    metadata_file_id = sa.Column(sa.Integer, sa.ForeignKey("metadata_file.id"))

class ShowEpisode(BaseModel):
    __tablename__ = "show_episode"
    name = sa.Column(sa.Text)
    episode_order_counter = sa.Column(sa.Integer)
    show_season_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("show_season.id"))
    video_files: sorm.Mapped[List["VideoFile"]] = sorm.relationship(secondary="show_episode_video_file",back_populates="show_episode")
    image_files: sorm.Mapped[List["ImageFile"]] = sorm.relationship(secondary="show_episode_image_file",back_populates="show_episode")
    metadata_files: sorm.Mapped[List["MetadataFile"]] = sorm.relationship(secondary="show_episode_metadata_file",back_populates="show_episode")
    season: sorm.Mapped["ShowSeason"] = sorm.relationship(back_populates="episodes")
    tags: sorm.Mapped["Tag"] = sorm.relationship(secondary="show_episode_tag",back_populates="show_episodes")

    def convert_local_paths_to_web_paths(self, config):
        shelf_root = self.season.show.shelf.directory.split("/")
        shelf_root.pop()
        shelf_root = "/".join(shelf_root)
        for video_file in self.video_files:
            video_file.set_web_path(
                config.web_media_url + video_file.path
            )
        for image_file in self.image_files:
            image_file.set_web_path(
                config.web_media_url + image_file.path
            )
            if "poster" in image_file.kind:
                self.main_poster_image = image_file
        for metadata_file in self.image_files:
            metadata_file.set_web_path(
                config.web_media_url + metadata_file.path
            )

class ShowEpisodeTag(BaseModel):
    __tablename__ = "show_episode_tag"
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey("show_episode.id"))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey("tag.id"))

class ShowEpisodeImageFile(BaseModel):
    __tablename__ = "show_episode_image_file"
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey("show_episode.id"))
    image_file_id = sa.Column(sa.Integer, sa.ForeignKey("image_file.id"))


class ShowEpisodeMetadataFile(BaseModel):
    __tablename__ = "show_episode_metadata_file"
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey("show_episode.id"))
    metadata_file_id = sa.Column(sa.Integer, sa.ForeignKey("metadata_file.id"))


class ShowEpisodeVideoFile(BaseModel):
    __tablename__ = "show_episode_video_file"
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey("show_episode.id"))
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey("video_file.id"))


class Streamable(BaseModel):
    __tablename__ = "streamable"
    url = sa.Column(sa.Text)
    name = sa.Column(sa.Text)
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("stream_source.id")
    )
    stream_source: sorm.Mapped["StreamSource"] = sorm.relationship(back_populates="streamables")

class StreamSource(BaseModel):
    __tablename__ = "stream_source"
    kind = sa.Column(sa.Text)
    name = sa.Column(sa.Text, unique=True)
    url = sa.Column(sa.Text, unique=True)
    username = sa.Column(sa.Text)
    password = sa.Column(sa.Text)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(
        cascade="delete",passive_deletes=True
    )

class StreamableChannel(BaseModel):
    __tablename__ = "streamable_channel"
    parsed_id = sa.Column(sa.Text)
    parsed_name = sa.Column(sa.Text)
    parsed_number = sa.Column(sa.Float)
    edited_id = sa.Column(sa.Text)
    edited_name = sa.Column(sa.Text)
    edited_number = sa.Column(sa.Float)
    schedules: sorm.Mapped[List["StreamableSchedule"]] = sorm.relationship(
        cascade="delete", passive_deletes=True
    )


class StreamableSchedule(BaseModel):
    __tablename__ = "streamable_schedule"
    name = sa.Column(sa.Text)
    description = sa.Column(sa.Text)
    start_datetime = sa.Column(sa.DateTime)
    stop_datetime = sa.Column(sa.DateTime)
    channel_id: sorm.Mapped[int] = sorm.mapped_column(
        sa.ForeignKey("streamable_channel.id")
    )
    channel: sorm.Mapped["StreamableChannel"] = sorm.relationship(back_populates="schedules")