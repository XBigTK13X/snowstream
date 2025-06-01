from log import log
from db import db


from message.handler.job_media_scope import JobMediaScope
from message.handler.child_job import create_child_job
from message.handler.update_media.provider.thetvdb_provider import ThetvdbProvider

def handle(job_id, scope:JobMediaScope):
    log.info(f"[WORKER] Handling an identify_unknown_media job")

    movies = []
    shows = []
    ticket = db.model.Ticket()
    if scope == None or scope.is_unscoped():
        movies = db.op.get_unknown_movie_list()
        shows = db.op.get_unknown_show_list()
    else:
        if scope.is_shelf():
            shelf = db.op.get_shelf_by_id(shelf_id=scope.target_id)
            if shelf.kind == 'Movies':
                movies = db.op.get_unknown_movie_list(shelf_id=shelf.id)
            elif shelf.kind == 'Shows':
                shows = db.op.get_unknown_show_list(shelf_id=shelf.id)
        elif scope.is_movie():
            movie = db.op.get_movie_by_id(ticket=ticket,movie_id=scope.target_id)
            movies = [movie]
        elif scope.is_show():
            show = db.op.get_show_by_id(ticket=ticket, show_id=scope.target_id)
            shows = [show]
        elif scope.is_season():
            show_season = db.op.get_show_season_by_id(ticket=ticket, season_id=scope.target_id)
            shows = [show_season.show]
        elif scope.is_episode():
            show_episode = db.op.get_show_episode_by_id(ticket=ticket, episode_id=scope.target_id)
            shows = [show_episode.season.show]

    media_provider = ThetvdbProvider()

    if len(movies) > 0:
        log.info(f"Identifying {len(movies)} unknown movies")
        for movie in movies:
            log.info(f"Searching media provider for movie {movie.directory}")
            identities = media_provider.identify(kind='Movie',query=movie.name,year=movie.release_year)
            if len(identities) > 0:
                identity = identities[0]
                log.info(f"Identified {movie.directory} as {identity['name']} [{identity['tvdbid']}]")
                db.op.update_movie_remote_id(movie_id=movie.id,remote_id=identity['tvdbid'])
                create_child_job(name="update_media_files",payload={
                    'metadata_id': identity['tvdbid'],
                    'target_kind': 'movie',
                    'target_id': movie.id,
                    'update_metadata': True,
                    'update_images': True,
                    'is_subjob': True
                })
            else:
                log.info(f"Unable to identify {movie.directory}")

    if len(shows) > 0:
        log.info(f"Identifying {len(shows)} unknown shows")
        for shows in shows:
            log.info(f"Searching media provider for show {show.directory}")
            identities = media_provider.identify(kind='Show',query=show.name,year=show.release_year)
            if len(identities) > 0:
                identity = identities[0]
                log.info(f"Identified {show.directory} as {identity['name']} [{identity['tvdbid']}]")
                db.op.update_show_remote_id(show_id=show.id,remote_id=identity['tvdbid'])
                db.op.update_show_release_year(show_id=show.id, release_year=identity['year'])
                create_child_job(name="update_media_files",payload={
                    'metadata_id': identity['tvdbid'],
                    'target_kind': 'show',
                    'target_id': show.id,
                    'update_metadata': True,
                    'update_images': True,
                    'is_subjob': True
                })
            else:
                log.info(f"Unable to identify {show.directory}")

    if len(shows) == 0 and len(movies) == 0:
        log.info("No movies nor shows found to identify.")

    return True
