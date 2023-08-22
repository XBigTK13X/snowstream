from typing import Union, Literal
from pydantic import BaseModel


class Kind(BaseModel):
    name: Union[Literal['stream-sources-refresh'], Literal['directories-scan']]


class StreamSource(BaseModel):
    id: int | None = None
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None
    remote_data: str | None = None


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
