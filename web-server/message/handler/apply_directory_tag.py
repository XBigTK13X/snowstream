from log import log
from db import db
import snow_media
import api_models as am


def handle(scope):
    db.op.update_job(job_id=scope.job_id, message=f"[WORKER] Handling an apply_directory_tag job")

    if not scope or not scope.is_directory():
        db.op.update_job(job_id=scope.job_id, message="apply_directory_tag must be scoped to a directory")
        return False

    db.op.update_job(job_id=scope.job_id, message=f"Applying tag [{scope.target_id}] to directory [{scope.target_directory}]")
    tag = db.op.get_tag_by_name(scope.target_id)
    if not tag:
        tag = db.op.upsert_tag(name=scope.target_id)

    movies = db.op.get_movie_list_by_directory(directory=scope.target_directory)
    movie_count = 1
    movie_max = len(movies)
    for movie in movies:
        if not movie.metadata_files:
            continue
        metadata = movie.metadata_files[0]
        if scope.update_metadata:
            db.op.update_job(job_id=scope.job_id, message=f"Movie ({movie_count}/{movie_max}) {movie.directory}")
            nfo_dict = snow_media.nfo.nfo_xml_to_dict(metadata.xml_content,step_into_root=False)
            if not 'tag' in nfo_dict['movie']:
                nfo_dict['movie']['tag'] = []
            if not tag.name in nfo_dict['movie']['tag']:
                nfo_dict['movie']['tag'].append(tag.name)
            nfo_xml = snow_media.nfo.nfo_dict_to_xml(nfo_dict)
            db.op.update_metadata_file_content(metadata_file_id=metadata.id,xml_content=nfo_xml)
            snow_media.nfo.save_xml_as_nfo(nfo_path=metadata.local_path, nfo_xml=nfo_xml)
            if not movie.tags or not tag.name in [xx.name for xx in movie.tags]:
                db.op.upsert_movie_tag(movie_id=movie.id,tag_id=tag.id)
        else:
            db.op.update_job(job_id=scope.job_id, message=f"Movie ({movie_count}/{movie_max}) [DRY] {movie.directory}")
        movie_count += 1

    shows = db.op.get_show_list_by_directory(directory=scope.target_directory)
    show_count = 1
    show_max = len(shows)
    for show in shows:
        if not show.metadata_files:
            continue
        metadata = show.metadata_files[0]
        if scope.update_metadata:
            db.op.update_job(job_id=scope.job_id, message=f"Show ({show_count}/{show_max}) {show.directory}")
            nfo_dict = snow_media.nfo.nfo_xml_to_dict(metadata.xml_content,step_into_root=False)
            if not 'tag' in nfo_dict['tvshow']:
                nfo_dict['tvshow']['tag'] = []
            if not tag.name in nfo_dict['tvshow']['tag']:
                nfo_dict['tvshow']['tag'].append(tag.name)
            nfo_xml = snow_media.nfo.nfo_dict_to_xml(nfo_dict)
            db.op.update_metadata_file_content(metadata_file_id=metadata.id,xml_content=nfo_xml)
            snow_media.nfo.save_xml_as_nfo(nfo_path=metadata.local_path, nfo_xml=nfo_xml)
            if not show.tags or not tag.name in [xx.name for xx in show.tags]:
                db.op.upsert_show_tag(show_id=show.id,tag_id=tag.id)
        else:
            db.op.update_job(job_id=scope.job_id, message=f"Show ({show_count}/{show_max}) [DRY] {show.directory}")
        show_count += 1

    if not shows and not movies:
        db.op.update_job(job_id=scope.job_id, message=f"No shows nor movies found in {scope.target_directory}")
        return False

    return True