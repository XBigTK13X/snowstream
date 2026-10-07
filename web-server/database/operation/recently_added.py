import datetime

from database.operation.db_internal import dbi

import database.operation.shelf as db_shelf
import database.operation.movie as db_movie
import database.operation.show_episode as db_episode


def _to_utc(dt_val: datetime.datetime | None) -> datetime.datetime | None:
    if dt_val is None:
        return None
    if dt_val.tzinfo is None or dt_val.tzinfo.utcoffset(dt_val) is None:
        return dt_val.replace(tzinfo=datetime.timezone.utc)
    return dt_val.astimezone(datetime.timezone.utc)


def get_recently_added_list(ticket: dbi.Ticket, days: int = 365, limit: int = 200):
    cutoff_datetime = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
        days=days
    )
    recent_items = []

    shelves = db_shelf.get_shelf_list(ticket=ticket)

    for shelf in shelves:
        if shelf.kind == "Movies":
            movies = db_movie.get_movie_list(
                ticket=ticket, shelf_id=shelf.id, load_files=True
            )
            if not movies:
                continue

            for movie in movies:
                movie_created = _to_utc(movie.created_at)
                if movie_created and movie_created >= cutoff_datetime:
                    movie = dbi.dm.set_primary_images(movie)
                    movie.recent_added_at = movie_created
                    recent_items.append(movie)

        if shelf.kind == "Shows":
            episodes = db_episode.get_show_episode_list(
                ticket=ticket,
                shelf_id=shelf.id,
                include_specials=False,
                load_episode_files=False,
            )
            if not episodes:
                continue

            show_groups = {}
            for episode in episodes:
                show_id = episode.season.show.id
                if show_id not in show_groups:
                    show_groups[show_id] = []
                show_groups[show_id].append(episode)

            for show_id, show_episodes in show_groups.items():
                min_show_season_number = (
                    min(
                        ep.season.season_order_counter
                        for ep in show_episodes
                        if ep.season.season_order_counter > 0
                    )
                    if any(ep.season.season_order_counter > 0 for ep in show_episodes)
                    else 1
                )

                recent_show_episodes = []
                for episode in show_episodes:
                    episode_created = _to_utc(episode.created_at)
                    if episode_created and episode_created >= cutoff_datetime:
                        episode.recent_added_at = episode_created
                        recent_show_episodes.append(episode)

                if not recent_show_episodes:
                    continue

                season_groups = {}
                for episode in recent_show_episodes:
                    season_id = episode.season.id
                    if season_id not in season_groups:
                        season_groups[season_id] = []
                    season_groups[season_id].append(episode)

                for season_id, season_episodes in season_groups.items():
                    target_season = season_episodes[0].season
                    target_show = target_season.show

                    min_episode_counter = min(
                        ep.episode_order_counter for ep in season_episodes
                    )
                    starts_at_first = min_episode_counter == 1

                    if starts_at_first:
                        if target_season.season_order_counter == min_show_season_number:
                            target_show = dbi.dm.set_primary_images(target_show)
                            target_show.recent_added_at = max(
                                ep.recent_added_at for ep in season_episodes
                            )
                            recent_items.append(target_show)
                        else:
                            target_show = dbi.dm.set_primary_images(target_show)
                            target_season.poster_image = target_show.poster_image
                            target_season.name = f"{target_show.name} - S{target_season.season_order_counter:02d}"
                            target_season.recent_added_at = max(
                                ep.recent_added_at for ep in season_episodes
                            )
                            recent_items.append(target_season)
                    else:
                        for episode in season_episodes:
                            episode = dbi.dm.set_primary_images(episode)
                            recent_items.append(episode)

    recent_items.sort(key=lambda xx: xx.recent_added_at, reverse=True)

    return recent_items[:limit]
