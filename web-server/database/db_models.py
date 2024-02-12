import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.ext.hybrid import hybrid_method
from typing import List

from database.sql_alchemy import BaseModel


class StreamSource(BaseModel):
    __tablename__ = "stream_source"
    kind = sa.Column(sa.Text)
    name = sa.Column(sa.Text, unique=True)
    url = sa.Column(sa.Text, unique=True)
    username = sa.Column(sa.Text)
    password = sa.Column(sa.Text)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(
        back_populates="stream_source", cascade="delete", passive_deletes=True)


class Job(BaseModel):
    __tablename__ = "job"
    kind = sa.Column(sa.Text)
    message = sa.Column(sa.Text)
    status = sa.Column(sa.Text)


class Streamable(BaseModel):
    __tablename__ = 'streamable'
    url = sa.Column(sa.Text)
    name = sa.Column(sa.Text)
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("stream_source.id"))
    stream_source: sorm.Mapped["StreamSource"] = sorm.relationship(back_populates="streamables")


class StreamableChannel(BaseModel):
    __tablename__ = 'streamable_channel'
    parsed_id = sa.Column(sa.Text)
    parsed_name = sa.Column(sa.Text)
    parsed_number = sa.Column(sa.Float)
    edited_id = sa.Column(sa.Text)
    edited_name = sa.Column(sa.Text)
    edited_number = sa.Column(sa.Float)
    schedules: sorm.Mapped[List["StreamableSchedule"]] = sorm.relationship(
        back_populates="channel", cascade="delete", passive_deletes=True)


class StreamableSchedule(BaseModel):
    __tablename__ = 'streamable_schedule'
    name = sa.Column(sa.Text)
    description = sa.Column(sa.Text)
    start_datetime = sa.Column(sa.DateTime)
    stop_datetime = sa.Column(sa.DateTime)
    channel_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("streamable_channel.id"))
    channel: sorm.Mapped["StreamableChannel"] = sorm.relationship(back_populates="schedules")


class CachedText(BaseModel):
    __tablename__ = 'cached_text'
    key = sa.Column(sa.Text)
    data = sa.Column(sa.Text)


class Shelf(BaseModel):
    __tablename__ = 'shelf'
    name = sa.Column(sa.Text)
    kind = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    direct_stream_url = sa.Column(sa.Text)
    movies: sorm.Mapped[List["Movie"]] = sorm.relationship(secondary="movie_shelf",back_populates="shelf")
    shows: sorm.Mapped[List["Show"]] = sorm.relationship(secondary="show_shelf",back_populates="shelf")


class VideoFile(BaseModel):
    __tablename__ = 'video_file'
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))
    kind = sa.Column(sa.Text)
    path = sa.Column(sa.Text)
    movie: sorm.Mapped['Movie'] = sorm.relationship(secondary='movie_video_file', back_populates="video_files")
    show_episode: sorm.Mapped['ShowEpisode'] = sorm.relationship(secondary='show_episode_video_file', back_populates="video_files")

    @hybrid_method
    def set_web_path(self,path) -> str:
        self.web_path = path
        return self.web_path


class Tag(BaseModel):
    __tablename__ = 'tag'
    name = sa.Column(sa.Text)
    #movies: sorm.Mapped[List["Movie"]] = sorm.relationship(secondary=movie_tag_association, back_populates="tags")
    #shows: sorm.Mapped[List["Show"]] = sorm.relationship(secondary=show_tag_association, back_populates="tags")


class Movie(BaseModel):
    __tablename__ = 'movie'
    name = sa.Column(sa.Text)
    release_year = sa.Column(sa.Integer)
    #tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary=movie_tag_association, back_populates="movies")
    video_files: sorm.Mapped[List["VideoFile"]] = sorm.relationship(secondary='movie_video_file', back_populates="movie")
    shelf: sorm.Mapped['Shelf'] = sorm.relationship(secondary="movie_shelf",back_populates="movies")


class Show(BaseModel):
    __tablename__ = 'show'
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    shelf: sorm.Mapped['Shelf'] = sorm.relationship(secondary='show_shelf',back_populates="shows")
    seasons: sorm.Mapped[List["ShowSeason"]] = sorm.relationship(back_populates="show")
    #tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary=show_tag_association, back_populates="shows")



class ShowSeason(BaseModel):
    __tablename__ = 'show_season'
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    season_order_counter = sa.Column(sa.Integer)
    show_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("show.id"))
    episodes: sorm.Mapped[List["ShowEpisode"]] = sorm.relationship(back_populates="season")
    show: sorm.Mapped['Show'] = sorm.relationship(back_populates="seasons")

class ShowEpisode(BaseModel):
    __tablename__ = 'show_episode'
    name = sa.Column(sa.Text)
    episode_order_counter = sa.Column(sa.Integer)
    show_season_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("show_season.id"))
    video_files: sorm.Mapped[List["VideoFile"]] = sorm.relationship(secondary='show_episode_video_file', back_populates="show_episode")
    season: sorm.Mapped['ShowSeason'] = sorm.relationship(back_populates="episodes")
    # video_file: sorm.Mapped["VideoFile"] = sorm.relationship(
    #    secondary=show_episode_video_file_association, back_populates="show")


class MovieVideoFile(BaseModel):
    __tablename__ = 'movie_video_file'
    movie_id = sa.Column(sa.Integer, sa.ForeignKey('movie.id'))
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey('video_file.id'))

class MovieShelf(BaseModel):
    __tablename__ = 'movie_shelf'
    movie_id = sa.Column(sa.Integer, sa.ForeignKey('movie.id'))
    shelf_id = sa.Column(sa.Integer, sa.ForeignKey('shelf.id'))

class MovieTag(BaseModel):
    __tablename__ = 'movie_tag'
    movie_id = sa.Column(sa.Integer, sa.ForeignKey('movie.id'))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey('tag.id'))

class ShowShelf(BaseModel):
    __tablename__ = 'show_shelf'
    show_id = sa.Column(sa.Integer, sa.ForeignKey('show.id'))
    shelf_id = sa.Column(sa.Integer, sa.ForeignKey('shelf.id'))

class ShowEpisodeVideoFile(BaseModel):
    __tablename__ = 'show_episode_video_file'
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey('show_episode.id'))
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey('video_file.id'))


class ShowTag(BaseModel):
    __tablename__ = 'show_tag'
    show_id = sa.Column(sa.Integer, sa.ForeignKey('show.id'))
    tag_id = sa.Column(sa.Integer, sa.ForeignKey('tag.id'))

class User(BaseModel):
    __tablename__ = 'snowstream_user'
    username = sa.Column(sa.Text,nullable=False)
    display_name = sa.Column(sa.Text,nullable=True)
    hashed_password = sa.Column(sa.Text,nullable=False)
    enabled = sa.Column(sa.Boolean)
    permissions = sa.Column(sa.Text)