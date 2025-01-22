from typing import Union, Literal
from pydantic import BaseModel


class JobKind(BaseModel):
    name: Union[Literal["stream_sources_refresh"], Literal["scan_shelves_content"]]


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


class User(BaseModel):
    id: int | None = None
    username: str
    display_name: str | None = None
    hashed_password: str | None = None
    raw_password: str | None = ''
    enabled: bool | None = True
    permissions: str


class AuthToken(BaseModel):
    access_token: str
    token_type: str


class AuthTokenContent(BaseModel):
    username: str | None = None
    scopes: list[str] = []


class UserAccess(BaseModel):
    user_id: int
    tag_ids: list[int]
    shelf_ids: list[int]
    stream_source_ids: list[int]