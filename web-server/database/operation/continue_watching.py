from log import log
import util

from database.sql_alchemy import DbSession
import database.db_models as dm
import sqlalchemy.orm as sorm

import database.operation.shelf as db_shelf
import database.operation.movie as db_movie
import database.operation.show as db_show
import database.operation.show_season as db_season
import database.operation.show_episode as db_episode

def get_continue_watching_list(ticket:dm.Ticket):
    with DbSession() as db:
        results = []
        movies_in_progress = (
            db.query(dm.WatchProgress)
            .filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.movie_id != None
            ).
            options(
                sorm.joinedload(dm.WatchProgress.movie)
                .joinedload(dm.Movie.shelf)
            )
            .all()
        )
        if movies_in_progress:
            items = []
            for progress in movies_in_progress:
                movie = dm.set_primary_images(progress.movie)
                items.append(movie)
            results.append({
                'kind': 'movies_in_progress',
                'name': 'Movies In Progress',
                'items': items
            })

        episodes_in_progress = (
            db.query(dm.WatchProgress)
            .filter(
                dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dm.WatchProgress.show_episode_id != None
            )
            .options(
                sorm.joinedload(dm.WatchProgress.show_episode)
                .joinedload(dm.ShowEpisode.season)
                .joinedload(dm.ShowSeason.show)
                .joinedload(dm.Show.shelf)
            ).all()
        )
        if episodes_in_progress:
            items = []
            for progress in episodes_in_progress:
                episode.poster_image = episode.season.show.poster_image
                items.append(episode)
            results.append({
                'kind': 'episodes_in_progress',
                'name': 'Episodes In Progress',
                'items': items
            })

        unwatched_movies = []
        new_episodes = []
        new_seasons = []
        new_shows = []
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        for shelf in shelves:
            if shelf.kind == 'Movies':
                movies = db_movie.get_movie_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    only_unwatched=True,
                    load_files=False
                )
                if not movies:
                    continue
                unwatched_movies += movies
            if shelf.kind == 'Shows':
                first_lookup = {}
                first_episodes = db_episode.get_show_episode_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    include_specials=False,
                    first_per_show=True,
                    load_episode_files=False
                )
                for episode in first_episodes:
                    first_lookup[episode.season.show.id] = episode

                unwatched_episodes = db_episode.get_show_episode_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    include_specials=False,
                    only_unwatched=True,
                    first_per_show=True,
                    load_episode_files=False
                )
                for episode in unwatched_episodes:
                    first_episode = first_lookup[episode.season.show.id]
                    if first_episode.id == episode.id:
                        new_shows.append(episode)
                    else:
                        if episode.episode_order_counter > 1:
                            new_episodes.append(episode)
                        else:
                            new_seasons.append(episode)


        if new_episodes:
            results.append({
                'kind': 'next_episodes',
                'name': "New Episodes",
                'items': new_episodes
            })
        if new_seasons:
            results.append({
                'kind': 'new_seasons',
                'name': "New Seasons",
                'items': new_seasons
            })
        if new_shows:
            results.append({
                'kind': 'new_shows',
                'name': 'New Shows',
                'items': new_shows
            })
        if unwatched_movies:
            results.append({
                'kind': 'new_movies',
                'name': 'New Movies',
                'items': unwatched_movies
            })

        return results