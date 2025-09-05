from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, or_
from datetime import datetime, timezone
from log import log
from settings import config
from sqlalchemy import text as sql_text
from sqlalchemy.sql import func, desc
import database.db_models as dm
import json
import os
import sqlalchemy as sa
import sqlalchemy.orm as orm
import util

class DbInternal:
    def __init__(self):
        self.engine = create_engine(config.postgres_url)
        self.config = config
        self.datetime = datetime
        self.desc = desc
        self.dm = dm
        self.func = func
        self.json = json
        self.log = log
        self.os = os
        self.sa = sa
        self.session = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.orm = orm
        self.sql_text = sql_text
        self.Ticket = dm.Ticket
        self.timezone = timezone
        self.util = util
        self.or_ = or_

dbi = DbInternal()