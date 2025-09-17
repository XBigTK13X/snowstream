from typing import Union, Literal
from pydantic import BaseModel

class User(BaseModel):
    id: int | None = None
    username: str
    display_name: str | None = None
    hashed_password: str | None = None
    raw_password: str | None = ''
    has_password: bool | None = False
    enabled: bool | None = True
    permissions: str
    cduid: int | None = None
    ticket: list[int] | None = None
    set_password: bool | None = False


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

class JobRequest(BaseModel):
    name: Union[
        Literal["channel_guide_refresh"],
        Literal["clean_file_records"],
        Literal['delete_media_records'],
        Literal["identify_unknown_media"],
        Literal["read_media_files"],
        Literal["sanitize_file_properties"],
        Literal["scan_shelves_content"],
        Literal["stream_sources_refresh"],
        Literal["update_media_files"],
    ]
    input: dict | None = None


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
    id: int
    name_display: str
    group_display: str
    url: str | None = None
    name: str | None = None
    stream_source_id: int | None = None


class ChannelGuideSource(BaseModel):
    id: int | None = None
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None

class Channel(BaseModel):
    id: int
    edited_number: int | None = None
    edited_name: str | None = None
    edited_id: str | None = None
    streamable_id: int | None = None

class ShelfKind(BaseModel):
    name: Union[
        Literal["Movies"],
        Literal["Shows"],
        Literal["Keepsakes"]
    ]


class Shelf(BaseModel):
    id: int | None = None
    kind: str
    name: str
    local_path: str
    network_path: str


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

class WatchProgress(BaseModel):
    show_episode_id: int  | None = None
    movie_id: int  | None = None
    streamable_id: int  | None = None
    duration_seconds: float | None = None
    played_seconds: float | None  = None

class QueueRequest(BaseModel):
    show_id:int | None = None
    show_season_id:int | None = None
    tag_id: int | None = None
    shuffle: bool | None = False

class SaveLogsRequest(BaseModel):
    logs: list[str] | None = None

class DisplayCleanupRule(BaseModel):
    id: int | None = None
    needle: str
    replacement: str
    target_kind: str | None = None
    rule_kind: str | None = None
    priority: int | None = None
