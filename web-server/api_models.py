from pydantic import BaseModel

class StreamSource(BaseModel):
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None
