import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from sqlalchemy.sql import func
import util
import database.operation.user as db_user
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode

def get_continue_watching_list(ticket:dm.Ticket):
    with DbSession() as db:
        results = []
        # TODO This is soooo inefficient. Improve this by joining the data server-side
        movies_in_progress = (
            db.query(dm.WatchProgress)
            .filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.movie_id != None
            ).all()
        )
        if movies_in_progress and len(movies_in_progress) > 0:
            items = []
            for progress in movies_in_progress:
                items.append(db_movie.get_movie_by_id(ticket=ticket,movie_id=progress.movie_id))
            results.append({
                'kind': 'movies_in_progress',
                'items': items
            })
        episodes_in_progress = (
            db.query(dm.WatchProgress)
            .filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.show_episode_id != None
            ).all()
        )
        if episodes_in_progress and len(episodes_in_progress) > 0:
            items = []
            for progress in episodes_in_progress:
                items.append(db_episode.get_show_episode_by_id(ticket=ticket,episode_id=progress.show_episode_id))
            results.append({
                'kind': 'episodes_in_progress',
                'items': items
            })
        return results