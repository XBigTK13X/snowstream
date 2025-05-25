import util
import database.db_models as dm
from database.sql_alchemy import DbSession
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
            ).all()
        )
        if movies_in_progress and len(movies_in_progress) > 0:
            items = []
            for progress in movies_in_progress:
                movie = db_movie.get_movie_by_id(ticket=ticket,movie_id=progress.movie_id)
                movie.kind = 'movie'
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
            ).all()
        )
        if episodes_in_progress and len(episodes_in_progress) > 0:
            items = []
            for progress in episodes_in_progress:
                episode = db_episode.get_show_episode_by_id(ticket=ticket,episode_id=progress.show_episode_id)
                episode.kind = 'episode'
                items.append(episode)
            results.append({
                'kind': 'episodes_in_progress',
                'name': 'Episodes In Progress',
                'items': items
            })

        unwatched_movies = []
        next_episodes = []
        new_seasons = []
        new_shows = []
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        for shelf in shelves:
            if shelf.kind == 'Movies':
                movies = db_movie.get_partial_shelf_movie_list(ticket=ticket,shelf_id=shelf.id,only_watched=False)
                for movie in movies:
                    movie.kind = 'movie'
                if not movies:
                    continue
                unwatched_movies += movies
            if shelf.kind == 'Shows':
                shows = db_show.get_partial_shelf_show_list(ticket=ticket,shelf_id=shelf.id,only_watched=False)
                if not shows:
                    continue
                for show in shows:
                    seasons = db_season.get_partial_show_season_list(ticket=ticket,show_id=show.id,only_watched=False)
                    if not seasons:
                        continue
                    seasons = [xx for xx in seasons if xx.season_order_counter > 0]
                    if not seasons:
                        continue
                    next_season = seasons[0]
                    episodes = db_episode.get_partial_show_episode_list(ticket=ticket,season_id=next_season.id,only_watched=False)
                    if not episodes:
                        continue
                    next_episode = episodes[0]
                    next_episode.kind = 'episode'
                    next_episode.season = next_season
                    next_episode.show = show
                    next_episode.poster_image = show.poster_image
                    next_episode.episode_slug = util.get_episode_slug(next_episode)
                    if next_season.season_order_counter == 1:
                        if next_episode.episode_order_counter == 1:
                            new_shows.append(next_episode)
                        else:
                            next_episodes.append(next_episode)
                    else:
                        if next_episode.episode_order_counter == 1:
                            new_seasons.append(next_episode)
                        else:
                            next_episodes.append(next_episode)
        if next_episodes and len(next_episodes) > 0:
            results.append({
                'kind': 'next_episodes',
                'name': "Next Episodes",
                'items': next_episodes
            })
        if new_seasons and len(new_seasons) > 0:
            results.append({
                'kind': 'new_seasons',
                'name': 'Next Seasons',
                'items': new_seasons
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

        return results