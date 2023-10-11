import sqlalchemy as sa
import sqlalchemy.orm as sorm
from typing import List

from database.sql_alchemy import BaseModel


class StreamSource(BaseModel):
    __tablename__ = "stream_sources"
    kind = sa.Column(sa.String)
    name = sa.Column(sa.String, unique=True)
    url = sa.Column(sa.String, unique=True)
    username = sa.Column(sa.String)
    password = sa.Column(sa.String)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(
        back_populates="stream_source", cascade="delete", passive_deletes=True)


class Job(BaseModel):
    __tablename__ = "jobs"
    kind = sa.Column(sa.String)
    message = sa.Column(sa.Text)
    status = sa.Column(sa.String)


class Streamable(BaseModel):
    __tablename__ = 'streamables'
    url = sa.Column(sa.String)
    name = sa.Column(sa.String)
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("stream_sources.id"))
    stream_source: sorm.Mapped["StreamSource"] = sorm.relationship(back_populates="streamables")


class StreamableChannel(BaseModel):
    __tablename__ = 'streamable_channels'
    parsed_id = sa.Column(sa.String)
    parsed_name = sa.Column(sa.String)
    parsed_number = sa.Column(sa.Float)
    edited_id = sa.Column(sa.String)
    edited_name = sa.Column(sa.String)
    edited_number = sa.Column(sa.Float)
    schedules: sorm.Mapped[List["StreamableSchedule"]] = sorm.relationship(
        back_populates="channel", cascade="delete", passive_deletes=True)


class StreamableSchedule(BaseModel):
    __tablename__ = 'streamable_schedules'
    name = sa.Column(sa.String)
    description = sa.Column(sa.Text)
    start_datetime = sa.Column(sa.DateTime)
    stop_datetime = sa.Column(sa.DateTime)
    channel_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("streamable_channels.id"))
    channel: sorm.Mapped["StreamableChannel"] = sorm.relationship(back_populates="schedules")


class CachedText(BaseModel):
    __tablename__ = 'cached_texts'
    key = sa.Column(sa.String)
    data = sa.Column(sa.Text)


class Shelf(BaseModel):
    __tablename__ = 'shelves'
    name = sa.Column(sa.String)
    directory = sa.Column(sa.String)
#
#
# class VideoFile(BaseModel):
#    __tablename__ = 'video_files'
#    kind = sa.Column(sa.String)
#    path = sa.Column(sa.Text)
#
#
# class Tag(BaseModel):
#    __tablename__ = 'tags'
#    name = sa.Column(sa.String)
#
#
# class Movie(BaseModel):
#    __tablename__ = 'movies'
#    name = sa.Column(sa.Text)
#    directory = sa.Column(sa.Text)
#    tags: sorm.Mapped[List['MovieTag']] = sorm.relationship(back_populates='movie')
#
#
# class MovieTag(BaseModel):
#    __tablename__ = 'movie_tags'
#    movie: sorm.Mapped['Movie'] = sorm.relationship(back_populates='tags')
#    tag: sorm.Mapped['Tag'] = sorm.relationship(back_populates='movie')
#
#
# class Show(BaseModel):
#    __tablename__ = 'shows'
#    name = sa.Column(sa.Text)
#    directory = sa.Column(sa.Text)
#    tags: sorm.Mapped[List['ShowTag']] = sorm.relationship(back_populates='show')
#
#
# class ShowTag(BaseModel):
#    __tablename__ = 'show_tags'
#    show: sorm.Mapped['Show'] = sorm.relationship(back_populates='tags')
#    tag: sorm.Mapped['Tag'] = sorm.relationship(back_populates='show')
#
#
# class ShowSeason(BaseModel):
#    __tablename__ = 'show_seasons'
#    name = sa.Column(sa.Text)
#    directory = sa.Column(sa.Text)
#
#
# class ShowEpisode(BaseModel):
#    __tablename__ = 'show_episodes'
#    name = sa.Column(sa.Text)
#
