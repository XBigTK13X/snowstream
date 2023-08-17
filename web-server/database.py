from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import DateTime, Column
from sqlalchemy.sql import func

from settings import config

engine = create_engine(
    config.postgres_url
)
DbSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseModel = declarative_base()
BaseModel.last_modified = Column(DateTime, onupdate=func.utc_timestamp()),
