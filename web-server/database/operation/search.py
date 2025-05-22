import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config

def perform_search(ticket:dm.Ticket,query:str):
    # TODO Actually search for things like movies, shows, episodes, streamables
    return {'items':[query]}