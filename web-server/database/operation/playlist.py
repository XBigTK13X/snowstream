import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.tag as db_tag


def get_playlist_list(ticket:dm.Ticket):
    with DbSession() as db:
        tags = db_tag.get_tag_list(ticket=ticket)
        if not tags:
            return None
        results = []
        for tag in tags:
            if 'Playlist:' in tag.name:
                tag.name = tag.name.replace('Playlist:','')
                results.append(tag)
        return results
