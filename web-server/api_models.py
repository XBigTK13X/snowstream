from typing import Union, Literal
from pydantic import BaseModel


class JobKind(BaseModel):
    name: Union[Literal['stream-sources-refresh'], Literal['scan-shelves-content']]


class StreamSource(BaseModel):
    id: int | None = None
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None


class Job(BaseModel):
    id: int | None = None
    kind: str
    message: str
    status: str


class Streamable(BaseModel):
    id: int | None = None
    url: str
    name: str
    stream_source_id: int


class ShelfKind(BaseModel):
    name: Union[Literal['Movies'], Literal['Shows']]


class Shelf(BaseModel):
    id: int | None = None
    kind: str
    name: str
    directory: str


class VideoFile(BaseModel):
    id: int | None = None


class Movie(BaseModel):
    id: int | None = None
    name: str
    directory: str


class Show(BaseModel):
    id: int | None = None
    name: str
    directory: str


class ShowSeason(BaseModel):
    id: int | None = None
    name: str
    directory: str


class ShowEpisode(BaseModel):
    id: int | None = None


class ShowVideoFile(BaseModel):
    id: int | None = None


class MovieVideoFile(BaseModel):
    id: int | None = None
