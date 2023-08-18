from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from database import BaseModel

class StreamSource(BaseModel):
    __tablename__ = "stream_sources"
    kind = Column(String)
    name = Column(String, unique=True)
    url = Column(String, unique=True)
    username = Column(String)
    password = Column(String)

class Job(BaseModel):
    __tablename__ = "jobs"
    kind = Column(String)
    message = Column(String)
    status = Column(String)