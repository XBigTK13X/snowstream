from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import BaseModel

class IptvSource(BaseModel):
    __tablename__ = "iptv_sources"
    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String)
    name = Column(String, unique=True)
    url = Column(String, unique=True)
    username = Column(String)
    password = Column(String)
