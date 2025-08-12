from database.operation.db_internal import dbi

import database.operation.shelf as db_shelf
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode

def get_continue_watching_list(ticket:dbi.Ticket):
    with dbi.session() as db:
        results = []
        skip_movie = {}
        in_progress = []
        movies_in_progress = (
            db.query(dbi.dm.WatchProgress)
            .filter(
                dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchProgress.movie_id != None
            ).
            options(
                dbi.orm.joinedload(dbi.dm.WatchProgress.movie)
                .joinedload(dbi.dm.Movie.shelf)
            )
            .all()
        )
        if movies_in_progress:
            for progress in movies_in_progress:
                movie = dbi.dm.set_primary_images(progress.movie)
                movie.progress_at = progress.updated_at
                skip_movie[movie.id] = True
                in_progress.append(movie)


        skip_episode = {}
        episodes_in_progress = (
            db.query(dbi.dm.WatchProgress)
            .filter(
                dbi.dm.WatchProgress.client_device_user_id.in_(ticket.watch_group),
                dbi.dm.WatchProgress.show_episode_id != None
            )
            .options(
                dbi.orm.joinedload(dbi.dm.WatchProgress.show_episode)
                .joinedload(dbi.dm.ShowEpisode.season)
                .joinedload(dbi.dm.ShowSeason.show)
                .joinedload(dbi.dm.Show.shelf)
            ).order_by(dbi.desc(dbi.dm.WatchProgress.updated_at)).all()
        )

        if episodes_in_progress:
            show_dedupe = {}
            delete_progress = []
            for progress in episodes_in_progress:
                if progress.show_episode.season.show.id in show_dedupe:
                    delete_progress.append(progress.id)
                    continue
                episode = progress.show_episode
                episode.progress_at = progress.updated_at
                skip_episode[episode.season.show.id] = True
                show = episode.season.show
                show = dbi.dm.set_primary_images(show)
                progress.show_episode.poster_image = show.poster_image
                in_progress.append(episode)
                show_dedupe[progress.show_episode.season.show.id] = True
            if delete_progress:
                db.query(dbi.dm.WatchProgress).filter(dbi.dm.WatchProgress.id.in_(delete_progress)).delete()

        if in_progress:
            in_progress.sort(key=lambda xx:xx.progress_at,reverse=True)
            results.append({
                'kind': 'in_progress',
                'name': 'In Progress',
                'items': in_progress
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
                unwatched_movies += [xx for xx in movies if not xx.id in skip_movie]
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
                    include_specials=True,
                    only_unwatched=True,
                    first_per_show=True,
                    load_episode_files=False,
                    bump_specials=True
                )
                for episode in unwatched_episodes:
                    if episode.season.show.id in skip_episode:
                        continue
                    if episode.season.show.id in first_lookup:
                        first_episode = first_lookup[episode.season.show.id]
                        if first_episode.id == episode.id:
                            new_shows.append(episode)
                        else:
                            if episode.episode_order_counter > 1:
                                new_episodes.append(episode)
                            else:
                                new_seasons.append(episode)
                    else:
                        # This is a Season 0 / Specials episode
                        new_episodes.append(episode)


        if new_episodes:
            results.append({
                'kind': 'next_episodes',
                'name': "Next Episodes",
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