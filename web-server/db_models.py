import sqlalchemy as sa
import sqlalchemy.orm as sorm
from typing import List

from database import BaseModel


class StreamSource(BaseModel):
    __tablename__ = "stream_sources"
    kind = sa.Column(sa.String)
    name = sa.Column(sa.String, unique=True)
    url = sa.Column(sa.String, unique=True)
    username = sa.Column(sa.String)
    password = sa.Column(sa.String)
    remote_data = sa.Column(sa.Text)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(back_populates="stream_source")


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
