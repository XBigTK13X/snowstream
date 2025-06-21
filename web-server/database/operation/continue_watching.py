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
    log.info("Building the continue watching results")
    with DbSession() as db:
        log.info("Connected to the DB")
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
        log.info("Queried movies in progress")
        if movies_in_progress and len(movies_in_progress) > 0:
            items = []
            for progress in movies_in_progress:
                movie = dm.set_primary_images(progress.movie)
                items.append(movie)
            results.append({
                'kind': 'movies_in_progress',
                'name': 'Movies In Progress',
                'items': items
            })
        log.info("Built movies in progress results")

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

        log.info("Queried episodes in progress")
        if episodes_in_progress and len(episodes_in_progress) > 0:
            items = []
            for progress in episodes_in_progress:
                episode.poster_image = episode.season.show.poster_image
                items.append(episode)
            results.append({
                'kind': 'episodes_in_progress',
                'name': 'Episodes In Progress',
                'items': items
            })

        log.info("Built episodes in progress results")

        show_posters = {}

        unwatched_movies = []
        new_episodes = []
        new_shows = []
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        log.info("DEBUG -- Got all shelves")
        for shelf in shelves:
            if shelf.kind == 'Movies':
                log.info(f"DEBUG -- Getting movie shelf {shelf.name}")
                movies = db_movie.get_movie_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    only_unwatched=True,
                    load_files=False
                )
                log.info(f"Loaded {len(movies)} movies")
                if not movies:
                    continue
                unwatched_movies += movies
            if shelf.kind == 'Shows':
                log.info(f"DEBUG -- Getting show shelf {shelf.name} episodes")
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
                log.info(f"DEBUG -- Building episode results from {len(unwatched_episodes)} unwatched episodes")
                for episode in unwatched_episodes:
                    #print(f'{episode.season.show.name} -> S{episode.season.season_order_counter} E{episode.episode_order_counter} watched[{episode.watched}]')
                    if episode.season.show.id in first_lookup and first_lookup[episode.season.show.id].id == episode.id:
                        new_shows.append(episode)
                    else:
                        new_episodes.append(episode)


        if new_episodes and len(new_episodes) > 0:
            results.append({
                'kind': 'next_episodes',
                'name': "New Episodes",
                'items': new_episodes
            })
        if new_shows and len(new_shows) > 0:
            results.append({
                'kind': 'new_shows',
                'name': 'New Shows',
                'items': new_shows
            })
        if unwatched_movies and len(unwatched_movies) > 0:
            results.append({
                'kind': 'new_movies',
                'name': 'New Movies',
                'items': unwatched_movies
            })

        log.info("All ready")

        return results