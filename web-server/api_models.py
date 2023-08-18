from pydantic import BaseModel

class IptvSource(BaseModel):
    kind: str
    url: str | None = None
    name: str
    username: str | None = None
    password: str | None = None
