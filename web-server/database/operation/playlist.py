import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.tag as db_tag
import database.operation.movie as db_movie
import database.operation.show as db_show


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

def get_playlist_by_tag_id(ticket:dm.Ticket, tag_id:int):
    with DbSession() as db:
        movies = db_movie.get_movie_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not movies:
            movies = []
        shows = db_show.get_show_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not shows:
            shows = []
        return sorted(movies + shows,key=lambda xx: xx.release_year)
