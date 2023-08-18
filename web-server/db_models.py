from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import BaseModel

class StreamSource(BaseModel):
    __tablename__ = "stream_sources"
    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String)
    name = Column(String, unique=True)
    url = Column(String, unique=True)
    username = Column(String)
    password = Column(String)

class Job(BaseModel):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String)
    message = Column(String)
    status = Column(String)