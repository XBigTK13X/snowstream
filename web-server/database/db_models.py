import sqlalchemy as sa
import sqlalchemy.orm as sorm
from typing import List

from database.sql_alchemy import BaseModel


class StreamSource(BaseModel):
    __tablename__ = "stream_source"
    kind = sa.Column(sa.String)
    name = sa.Column(sa.String, unique=True)
    url = sa.Column(sa.String, unique=True)
    username = sa.Column(sa.String)
    password = sa.Column(sa.String)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(
        back_populates="stream_source", cascade="delete", passive_deletes=True)


class Job(BaseModel):
    __tablename__ = "job"
    kind = sa.Column(sa.String)
    message = sa.Column(sa.Text)
    status = sa.Column(sa.String)


class Streamable(BaseModel):
    __tablename__ = 'streamable'
    url = sa.Column(sa.String)
    name = sa.Column(sa.String)
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("stream_source.id"))
    stream_source: sorm.Mapped["StreamSource"] = sorm.relationship(back_populates="streamables")


class StreamableChannel(BaseModel):
    __tablename__ = 'streamable_channel'
    parsed_id = sa.Column(sa.String)
    parsed_name = sa.Column(sa.String)
    parsed_number = sa.Column(sa.Float)
    edited_id = sa.Column(sa.String)
    edited_name = sa.Column(sa.String)
    edited_number = sa.Column(sa.Float)
    schedules: sorm.Mapped[List["StreamableSchedule"]] = sorm.relationship(
        back_populates="channel", cascade="delete", passive_deletes=True)


class StreamableSchedule(BaseModel):
    __tablename__ = 'streamable_schedule'
    name = sa.Column(sa.String)
    description = sa.Column(sa.Text)
    start_datetime = sa.Column(sa.DateTime)
    stop_datetime = sa.Column(sa.DateTime)
    channel_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("streamable_channel.id"))
    channel: sorm.Mapped["StreamableChannel"] = sorm.relationship(back_populates="schedules")


class CachedText(BaseModel):
    __tablename__ = 'cached_text'
    key = sa.Column(sa.String)
    data = sa.Column(sa.Text)


class Shelf(BaseModel):
    __tablename__ = 'shelf'
    name = sa.Column(sa.String)
    kind = sa.Column(sa.String)
    directory = sa.Column(sa.String)


class VideoFile(BaseModel):
    __tablename__ = 'video_file'
    shelf_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("shelf.id"))
    kind = sa.Column(sa.String)
    path = sa.Column(sa.Text)
    # show_episode: sorm.Mapped['ShowEpisode'] = sorm.relationship(
    #    secondary=show_episode_video_file_association, back_populates="video_file")
    movie: sorm.Mapped['Movie'] = sorm.relationship(secondary='movie_video_file', back_populates="video_files")


class Tag(BaseModel):
    __tablename__ = 'tag'
    name = sa.Column(sa.String)
    #movies: sorm.Mapped[List["Movie"]] = sorm.relationship(secondary=movie_tag_association, back_populates="tags")
    #shows: sorm.Mapped[List["Show"]] = sorm.relationship(secondary=show_tag_association, back_populates="tags")


class Movie(BaseModel):
    __tablename__ = 'movie'
    name = sa.Column(sa.Text)
    release_year = sa.Column(sa.Integer)
    #tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary=movie_tag_association, back_populates="movies")
    video_files: sorm.Mapped[List["VideoFile"]] = sorm.relationship(secondary='movie_video_file', back_populates="movie")


class Show(BaseModel):
    __tablename__ = 'show'
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)
    #tags: sorm.Mapped[List["Tag"]] = sorm.relationship(secondary=show_tag_association, back_populates="shows")


class ShowSeason(BaseModel):
    __tablename__ = 'show_season'
    name = sa.Column(sa.Text)
    directory = sa.Column(sa.Text)


class ShowEpisode(BaseModel):
    __tablename__ = 'show_episode'
    name = sa.Column(sa.Text)
    # video_file: sorm.Mapped["VideoFile"] = sorm.relationship(
    #    secondary=show_episode_video_file_association, back_populates="show")


class MovieVideoFile(BaseModel):
    __tablename__ = 'movie_video_file'
    movie_id = sa.Column(sa.Integer, sa.ForeignKey('movie.id'))
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey('video_file.id'))


class MovieTag(BaseModel):
    __tablename__ = 'movie_tag'
    movie_id = sa.Column(sa.Integer, sa.ForeignKey('movie.id'), primary_key=True)
    tag_id = sa.Column(sa.Integer, sa.ForeignKey('tag.id'), primary_key=True)


class ShowEpisodeVideoFile(BaseModel):
    __tablename__ = 'show_episode_video_file'
    show_episode_id = sa.Column(sa.Integer, sa.ForeignKey('show_episode.id'), primary_key=True)
    video_file_id = sa.Column(sa.Integer, sa.ForeignKey('video_file.id'), primary_key=True)


class ShowTag(BaseModel):
    __tablename__ = 'show_tag'
    show_id = sa.Column(sa.Integer, sa.ForeignKey('show.id'), primary_key=True)
    tag_id = sa.Column(sa.Integer, sa.ForeignKey('tag.id'), primary_key=True)
