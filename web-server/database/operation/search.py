import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.shelf as db_shelf
import database.operation.movie as db_movie
import database.operation.show as db_show
import database.operation.show_episode as db_episode

def perform_search(ticket:dm.Ticket,query:str):
    # TODO Actually search for things like movies, shows, episodes, streamables

    result = {}
    with DbSession() as db:
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        result['movies'] = []
        result['shows'] = []
        result['episodes'] = []
        for shelf in shelves:
            if shelf.kind == 'Movies':
                movies = db_movie.get_movie_list_by_shelf(ticket=ticket,shelf_id=shelf.id,search_query=query)
                if movies:
                    result['movies'] += movies
            elif shelf.kind == 'Shows':
                shows = db_show.get_show_list_by_shelf(ticket=ticket,shelf_id=shelf.id,search_query=query)
                if shows:
                    result['shows'] += shows

    return result