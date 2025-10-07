from database.operation.db_internal import dbi
import database.operation.shelf as db_shelf
import database.operation.movie as db_movie
import database.operation.show as db_show
import database.operation.show_episode as db_episode
import database.operation.streamable as db_streamable

def perform_search(ticket:dbi.dm.Ticket,query:str):
    result = {}
    with dbi.session() as db:
        shelves = db_shelf.get_shelf_list(ticket=ticket)
        results = []
        movie_results = []
        show_results = []
        episode_results = []
        for shelf in shelves:
            if shelf.kind == 'Movies':
                movies = db_movie.get_movie_list(ticket=ticket, shelf_id=shelf.id, search_query=query)
                if movies:
                    movie_results += movies
            elif shelf.kind == 'Shows':
                shows = db_show.get_show_list_by_shelf(ticket=ticket, shelf_id=shelf.id, search_query=query)
                if shows:
                    show_results += shows
                episodes = db_episode.get_show_episode_list(ticket=ticket, shelf_id=shelf.id, search_query=query)
                if episodes:
                    episode_results += episodes
        if movie_results:
            movie_results.sort(key=lambda xx:len(xx.name))
            results.append({
                'kind': 'movies',
                'name': 'Movies',
                'items': movie_results
            })
        if show_results:
            show_results.sort(key=lambda xx:len(xx.name))
            results.append({
                'kind': 'shows',
                'name': 'Shows',
                'items': show_results
            })
        if episode_results:
            episode_results.sort(key=lambda xx:len(xx.name))
            results.append({
                'kind': 'episodes',
                'name': 'Episodes',
                'items': episode_results
            })

        streamables = db_streamable.get_streamable_list(ticket=ticket,search_query=query)
        if streamables:
            streamables.sort(key=lambda xx:len(xx.name))
            results.append({
                'kind': 'streamables',
                'name': 'Streamables',
                'items': streamables
            })

    return results