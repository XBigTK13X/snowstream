import sqlalchemy
from sqlalchemy import create_engine, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import DateTime, Column, Integer
from sqlalchemy.sql import func

from settings import config

engine = create_engine(config.postgres_url)
DbSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseModel = declarative_base()
BaseModel.id = Column(Integer, primary_key=True, index=True)
BaseModel.created_at = Column(DateTime, default=func.now())
BaseModel.updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


def DbTruncate(table_name):
    if not table_name:
        raise Exception("DbTruncate must be called on an existing table_name")
    with DbSession() as db:
        db.execute(sqlalchemy.text(f"truncate {table_name} cascade"))
        db.commit()
