from database.operation.db_internal import dbi
import database.operation.movie as db_movie
import database.operation.show as db_show
import random

def get_movie_playlist_list(ticket:dbi.dm.Ticket,found_tags:dict):
    with dbi.session() as db:
        movie_query = '''
        select
            distinct on (tag.id)
            tag.id as tag_id,
            array_remove(array_agg(tag.name),NULL) as tag_name_list,
            array_remove(array_agg(image_file.thumbnail_web_path order by random()),NULL) as image_list
        from tag
            join movie_tag on movie_tag.tag_id = tag.id
            join movie_image_file on movie_image_file.movie_id = movie_tag.movie_id
            join image_file on movie_image_file.image_file_id = image_file.id
        where
            tag.name ilike '%Playlist%'
            and image_file.kind = 'movie_main_feature_poster'
        group by
            tag.id
        '''

        # Even if the playlist isn't allowed for a ticket
        # Allow the playlist to be shown if it has any content
        # That IS allowed
        movie_tag_allowed = {}
        if ticket.has_tag_restrictions():
            movie_check_query = f'''
            with playlist_tags as (
                select
                    tag.id as tag_id,
                    movie_tag.movie_id
                from tag
                join movie_tag on tag.id = movie_tag.tag_id
                where tag.name ilike '%Playlist%'
            ),
            allowed_movies as (
                select
                    movie_tag_a.movie_id
                from movie_tag as movie_tag_a
                    join movie_tag as movie_tag_b on movie_tag_a.movie_id = movie_tag_b.movie_id
                where
                    movie_tag_a.tag_id != movie_tag_b.tag_id
                    and movie_tag_b.tag_id in ({ticket.tag_csv()})
                group by
                    movie_tag_a.movie_id
            )
            select
                distinct on (playlist_tags.tag_id)
                playlist_tags.tag_id
            from playlist_tags
                join allowed_movies on playlist_tags.movie_id = allowed_movies.movie_id
            group by
                playlist_tags.tag_id
            '''
            cursor = db.execute(dbi.sql_text(movie_check_query))
            for row in cursor:
                movie_tag_allowed[row.tag_id] = True


        cursor = db.execute(dbi.sql_text(movie_query))
        for row in cursor:
            if row.tag_id in found_tags:
                continue
            if not ticket.is_allowed(tag_id=row.tag_id) and not row.tag_id in movie_tag_allowed:
                continue
            tag = {
                'id': row.tag_id,
                'name': row.tag_name_list[0].replace('Playlist:',''),
                'thumbnail_url': row.image_list[0],
                'model_kind': 'playlist'
            }
            found_tags[tag['id']] = tag

    return found_tags

def get_show_playlist_list(ticket:dbi.dm.Ticket,found_tags:dict):
    with dbi.session() as db:
        show_query = '''
        select
            distinct on (tag.id)
            tag.id as tag_id,
            array_remove(array_agg(tag.name),NULL) as tag_name_list,
            array_remove(array_agg(image_file.thumbnail_web_path order by random()),NULL) as image_list
        from tag
            join show_tag on show_tag.tag_id = tag.id
            join show_image_file on show_image_file.show_id = show_tag.show_id
            join image_file on show_image_file.image_file_id = image_file.id
        where
            tag.name ilike '%Playlist%'
            and image_file.kind = 'show_poster'
        group by
            tag.id
        '''

        show_tag_allowed = {}
        if ticket.has_tag_restrictions():
            show_check_query = f'''
            with playlist_tags as (
                select
                    tag.id as tag_id,
                    show_tag.show_id as show_id
                from tag
                    join show_tag on tag.id = show_tag.tag_id
                where
                    tag.name ilike '%Playlist%'
            ),
            allowed_shows as (
                select
                    show_tag_a.show_id
                from show_tag as show_tag_a
                    join show_tag as show_tag_b on show_tag_a.show_id = show_tag_b.show_id
                where
                    show_tag_a.tag_id != show_tag_b.tag_id
                    and show_tag_b.tag_id in ({ticket.tag_csv()})
                group by
                    show_tag_a.show_id
            )
            select
                distinct on (playlist_tags.tag_id)
                playlist_tags.tag_id
            from playlist_tags
                join allowed_shows on playlist_tags.show_id = allowed_shows.show_id
            group by
                playlist_tags.tag_id
            '''
            cursor = db.execute(dbi.sql_text(show_check_query))
            for row in cursor:
                show_tag_allowed[row.tag_id] = True

        cursor = db.execute(dbi.sql_text(show_query))
        for row in cursor:
            if row.tag_id in found_tags:
                # This makes it so that is a tag has movies and shows
                # Sometimes the show will be chosen for displaying a poster
                if random.choice([True,False]):
                    continue
            if not ticket.is_allowed(tag_id=row.tag_id) and not row.tag_id in show_tag_allowed:
                continue
            tag = {
                'id': row.tag_id,
                'name': row.tag_name_list[0].replace('Playlist:',''),
                'thumbnail_url': row.image_list[0],
                'model_kind': 'playlist'
            }
            found_tags[tag['id']] = tag
    return found_tags


def get_playlist_list(ticket:dbi.dm.Ticket):
    found_tags = get_movie_playlist_list(ticket=ticket,found_tags={})
    found_tags = get_show_playlist_list(ticket=ticket,found_tags=found_tags)
    if not found_tags:
        return None
    tags = sorted(found_tags.values(),key=lambda xx:xx['name'])
    return tags

def get_playlist_by_tag_id(ticket:dbi.dm.Ticket, tag_id:int):
    with dbi.session() as db:
        movies = db_movie.get_movie_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not movies:
            movies = []
        shows = db_show.get_show_list_by_tag_id(ticket=ticket, tag_id=tag_id)
        if not shows:
            shows = []
        return sorted(movies + shows,key=lambda xx: xx.release_year)
