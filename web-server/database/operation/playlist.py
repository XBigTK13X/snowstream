import database.db_models as dm
import api_models as am
from database.sql_alchemy import DbSession
from log import log
import sqlalchemy as sa
import sqlalchemy.orm as sorm
from settings import config
import database.operation.tag as db_tag
import database.operation.movie as db_movie
import database.operation.show as db_show
from sqlalchemy import text as sql_text

def get_playlist_list(ticket:dm.Ticket):
    with DbSession() as db:
        movie_query = '''
        select
        distinct on (tag.id)
        tag.id as tag_id,
        array_remove(array_agg(tag.name),NULL) as tag_name_list,
        array_remove(array_agg(image_file.thumbnail_web_path),NULL) as image_list
        from
        tag
        join movie_tag on movie_tag.tag_id = tag.id
        join movie_image_file on movie_image_file.movie_id = movie_tag.movie_id
        join image_file on movie_image_file.image_file_id = image_file.id
        where
        tag.name ilike '%Playlist%'
        and image_file.kind = 'movie_main_feature_poster'
        group by
        tag.id
        '''

        tags = []
        found_tags = {}

        cursor = db.execute(sql_text(movie_query))
        for row in cursor:
            if row.tag_id in found_tags:
                continue
            if not ticket.is_allowed(tag_id=row.tag_id):
                continue
            tag = {
                'id': row.tag_id,
                'name': row.tag_name_list[0].replace('Playlist:',''),
                'thumbnail_url': row.image_list[0],
                'model_kind': 'playlist'
            }
            tags.append(tag)
            found_tags[tag['id']] = True

        show_query = '''
        select
        distinct on (tag.id)
        tag.id as tag_id,
        array_remove(array_agg(tag.name),NULL) as tag_name_list,
        array_remove(array_agg(image_file.thumbnail_web_path),NULL) as image_list
        from
        tag
        join show_tag on show_tag.tag_id = tag.id
        join show_image_file on show_image_file.show_id = show_tag.show_id
        join image_file on show_image_file.image_file_id = image_file.id
        where
        tag.name ilike '%Playlist%'
        and image_file.kind = 'show_poster'
        group by
        tag.id
        '''

        cursor = db.execute(sql_text(show_query))
        for row in cursor:
            if row.tag_id in found_tags:
                continue
            if not ticket.is_allowed(tag_id=row.tag_id):
                continue
            tag = {
                'id': row.tag_id,
                'name': row.tag_name_list[0].replace('Playlist:',''),
                'thumbnail_url': row.image_list[0],
                'model_kind': 'playlist'
            }
            tags.append(tag)
            found_tags[tag['id']] = True

        if not tags:
            return None

        tags = sorted(tags,key=lambda xx:xx['name'])

        return tags

def get_playlist_by_tag_id(ticket:dm.Ticket, tag_id:int):
    with DbSession() as db:
        movies = db_movie.get_movie_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not movies:
            movies = []
        shows = db_show.get_show_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not shows:
            shows = []
        return sorted(movies + shows,key=lambda xx: xx.release_year)
