from typing import Union, Literal
from pydantic import BaseModel

class User(BaseModel):
    id: int | None = None
    username: str
    display_name: str | None = None
    hashed_password: str | None = None
    raw_password: str | None = ''
    enabled: bool | None = True
    permissions: str
    client_device_user_id: int | None = None


class AuthToken(BaseModel):
    access_token: str
    token_type: str


class AuthTokenContent(BaseModel):
    username: str | None = None
    scopes: list[str] = []
    client_device_user_id: int

class UserAccess(BaseModel):
    user_id: int
    tag_ids: list[int]
    shelf_ids: list[int]
    stream_source_ids: list[int]

class JobKind(BaseModel):
    name: Union[
        Literal["stream_sources_refresh"],
        Literal["scan_shelves_content"],
        Literal["read_media_files"]
    ]


class Job(BaseModel):
    id: int | None = None
    kind: str
    message: str
    status: str

class StreamSource(BaseModel):
    id: int | None = None
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None


class Streamable(BaseModel):
    id: int | None = None
    url: str
    name: str
    stream_source_id: int


class ShelfKind(BaseModel):
    name: Union[Literal["Movies"], Literal["Shows"]]


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


class Tag(BaseModel):
    id: int | None = None
    name: str

class WatchStatus(BaseModel):
    status: bool
    movie_id: int | None = None
    episode_id: int | None = None
    streamable_id: int | None = None