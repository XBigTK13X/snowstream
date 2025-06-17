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
                episode = dm.set_primary_images(progress.show_episode)
                items.append(episode)
            results.append({
                'kind': 'episodes_in_progress',
                'name': 'Episodes In Progress',
                'items': items
            })

        log.info("Built episodes in progress results")

        unwatched_movies = []
        new_episodes = []
        new_shows = []
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        log.info("Got all shelves")
        for shelf in shelves:
            if shelf.kind == 'Movies':
                log.info(f"Getting movie shelf {shelf.name}")
                movies = db_movie.get_partial_shelf_movie_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    only_watched=False
                )
                log.info(f"Loaded {len(movies)} movies")
                if not movies:
                    continue
                unwatched_movies += movies
            if shelf.kind == 'Shows':
                log.info(f"Getting show shelf {shelf.name}")
                episodes = db_episode.get_show_episode_list(
                    ticket=ticket,
                    shelf_id=shelf.id,
                    include_specials=False
                )
                log.info(f"Getting watched")
                watched = (
                    db.query(dm.Watched)
                    .filter(
                        dm.Watched.shelf_id == shelf.id,
                        dm.Watched.client_device_user_id.in_(ticket.watch_group)
                    )
                )
                watched_lookup = {
                    'shelf': {},
                    'show': {},
                    'season': {},
                    'episode': {}
                }
                for watch in watched:
                    if watch.shelf_id:
                        if watch.show_id:
                            if watch.show_season_id:
                                if watch.show_episode_id:
                                    watched_lookup['episode'][watch.show_episode_id] = True
                                else:
                                    watched_lookup['season'][watch.show_season_id] = True
                            else:
                                watched_lookup['show'][watch.show_id] = True
                        else:
                            watched_lookup['shelf'][watch.shelf_id] = True
                if shelf.id in watched_lookup['shelf']:
                    continue
                log.info(f"Building episode results")
                first_episodes = {}
                earliest_unwatched_episodes = {}
                MAX_COUNTER = 999999999
                for episode in episodes:
                    if not episode.season.show.id in first_episodes:
                        first_episodes[episode.season.show.id] = {'count':MAX_COUNTER, 'episode':None}
                    episode_counter = episode.season.season_order_counter * 1000 + episode.episode_order_counter
                    if episode_counter < first_episodes[episode.season.show.id]['count']:
                        first_episodes[episode.season.show.id] = {'count':episode_counter, 'episode': episode}

                    if episode.season.show.id in watched_lookup['show']:
                        continue
                    if episode.season.id in watched_lookup['season']:
                        continue
                    if episode.id in watched_lookup['episode']:
                        continue
                    if not episode.season.show.id in earliest_unwatched_episodes:
                        earliest_unwatched_episodes[episode.season.show.id] = {'count': MAX_COUNTER, 'episode': None}

                    if episode_counter < earliest_unwatched_episodes[episode.season.show.id]['count']:
                        earliest_unwatched_episodes[episode.season.show.id] = {'count': episode_counter, 'episode': episode}

                for show_id,entry in earliest_unwatched_episodes.items():
                    first_episode = first_episodes[show_id]['episode']
                    unwatched_episode = entry['episode']
                    if first_episode.id == unwatched_episode.id:
                        new_shows.append(dm.set_primary_images(unwatched_episode))
                    else:
                        new_episodes.append(dm.set_primary_images(unwatched_episode))

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