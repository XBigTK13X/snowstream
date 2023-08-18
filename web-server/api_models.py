from pydantic import BaseModel

class StreamSource(BaseModel):
    id: int
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None

class Job(BaseModel):
    id: int
    kind: str
    message: str
    status: str