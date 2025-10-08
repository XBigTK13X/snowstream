import cache
import json
import util
import uuid
import os
from datetime import datetime, timezone

from fastapi import Response, Request
from fastapi import Security
from fastapi.responses import PlainTextResponse

from auth import get_current_user
from db import db
from log import log
from settings import config
from snow_media.transcode_sessions import transcode_sessions
from typing import Annotated
import api_models as am
import message.write
import snow_media

def register(router):
    router = no_auth_required(router)
    return auth_required(router)

def auth_required(router):
    @router.get("/auth/check",tags=['User'])
    def auth_check(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return True

    @router.get("/stream/source/list",tags=['Stream Source'])
    def get_stream_source_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_stream_source_list(
            ticket=auth_user.ticket
        )

    @router.post("/stream/source",tags=['Stream Source'])
    def save_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source: am.StreamSource,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_stream_source(ticket=auth_user.ticket,stream_source=stream_source)

    @router.delete("/stream/source/{stream_source_id}",tags=['Stream Source'])
    def delete_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_stream_source_by_id(stream_source_id=stream_source_id)


    @router.get("/stream/source",tags=['Stream Source'])
    def get_stream_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        stream_source_id: int,
    ):
        if not auth_user.ticket.is_allowed(stream_source_id=stream_source_id):
            return None
        stream_source = db.op.get_stream_source_by_id(ticket=auth_user.ticket,stream_source_id=stream_source_id)
        stream_source.grouped_streamables = {}
        stream_source.groups = []
        stream_source.has_guide = False
        channel_lookup = {}
        now = datetime.now()
        for streamable in stream_source.streamables:
            if streamable.channel:
                stream_source.has_guide = True
                streamable.current_program = None
                soonest = None
                # TODO This could be a complex sql query like the episode list query
                for program in streamable.channel.programs:
                    if program.start_datetime <= now and program.stop_datetime >= now:
                        program.display_time = program.start_datetime.strftime('%I:%M %p')
                        streamable.current_program = program
                    else:
                        if program.start_datetime > now:
                            if soonest == None or program.start_datetime < soonest.start_datetime:
                                soonest = program
                if soonest:
                    soonest.display_time = soonest.start_datetime.strftime('%I:%M %p')
                    streamable.next_program = soonest
            group = streamable.group_display if streamable.group_display else streamable.group
            if group == None:
                group = 'No Group'
            if not group in stream_source.grouped_streamables:
                stream_source.groups.append(group)
                stream_source.grouped_streamables[group] = []
            stream_source.grouped_streamables[group].append(streamable)
        for streamable in stream_source.streamables:
            if streamable.channel:
                del streamable.channel.programs
        if stream_source.kind == 'HdHomeRun' or stream_source.kind == 'IptvM3u':
            stream_source.streamables = sorted(stream_source.streamables,key=lambda xx:xx.name)
            for group in stream_source.groups:
                stream_source.grouped_streamables[group].sort(key=lambda xx:xx.name_display if xx.name_display else xx.name)
        stream_source.groups.sort()
        stream_source.has_groups = True
        if len(stream_source.groups) == 1:
            if stream_source.groups[0] == 'No Group':
                stream_source.has_groups = False

        return stream_source

    @router.get("/streamable",tags=['Stream Source'])
    def get_streamable(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        streamable_id: int,
    ):
        streamable = db.op.get_streamable_by_id(streamable_id=streamable_id)
        if streamable.stream_source.kind == 'TubeArchivist':
            info = snow_media.video.get_snowstream_info(streamable.url)
            streamable.duration_seconds = info['snowstream_info']['duration_seconds']
        return streamable

    @router.post('/streamable',tags=['Stream Source'])
    def update_streamable(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        streamable: am.Streamable
    ):
        return db.op.update_streamable_display(
            streamable_id=streamable.id,
            group_display=streamable.group_display,
            name_display=streamable.name_display
        )

    @router.get('/streamable/list',tags=['Channel Guide'])
    def get_streamable_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
    ):
        stream_sources = db.op.get_stream_source_list(ticket=auth_user.ticket,streamables=True)
        streamables = []
        for source in stream_sources:
            if source.kind == 'HdHomeRun' or source.kind == 'IptvM3u':
                streamables += source.streamables
        streamables = sorted(streamables,key=lambda xx:xx.name)
        return streamables

    @router.get("/channel/guide/source/list",tags=['Channel Guide'])
    def get_channel_guide_source_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_channel_guide_source_list()

    @router.post("/channel/guide/source",tags=['Channel Guide'])
    def save_channel_guide_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        guide_source: am.ChannelGuideSource,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_channel_guide_source(guide_source=guide_source)

    @router.delete("/channel/guide/source/{channel_guide_source_id}",tags=['Channel Guide'])
    def delete_channel_guide_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        channel_guide_source_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_channel_guide_source_by_id(channel_guide_source_id=channel_guide_source_id)


    @router.get("/channel/guide/source",tags=['Channel Source'])
    def get_channel_guide_source(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        channel_guide_source_id:int
    ):
        source = db.op.get_channel_guide_source_by_id(channel_guide_source_id=channel_guide_source_id)
        if source.channels:
            source.channels = sorted(source.channels,key=lambda xx: xx.parsed_id)
        return source

    @router.post("/channel",tags=['Channel Guide'])
    def save_channel(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        channel: am.Channel,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.update_channel(channel=channel)

    @router.post("/job",tags=['Job'])
    def create_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        jobRequest: am.JobRequest,
    ):
        if not auth_user.is_admin():
            return False
        job = db.op.create_job(kind=jobRequest.name,input=jobRequest.input)
        message.write.send(job_id=job.id, kind=jobRequest.name, input=jobRequest.input, auth_user=auth_user)
        return job

    @router.get("/job",tags=['Job'])
    def get_job(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        job_id: int,
    ):
        return db.op.get_job_by_id(job_id=job_id)

    @router.get("/job/list", tags=['Job'])
    def get_job_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_complete: bool = True,
        limit: int = 50
    ):
        return db.op.get_job_list(show_complete=show_complete, limit=limit)

    @router.post('/log/playback', tags=['User'])
    def save_playback_logs(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        saveLogsRequest:am.SaveLogsRequest
    ):
        playback_id = str(uuid.uuid4())
        cache_key = f'playback-log-{playback_id}'
        seven_days_seconds = 604800
        db.op.upsert_cached_text(key=cache_key, data='\n'.join(saveLogsRequest.logs), ttl_seconds=seven_days_seconds)
        return {'cache_key':cache_key}

    @router.get('/log/list', tags=['Job'])
    def get_log_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        playback_logs = db.op.get_cached_text_list(search_query="playback-log-")
        transcode_logs = []
        for root, dirs, files in os.walk(config.transcode_log_dir):
            for ff in files:
                transcode_logs.append(os.path.join(root,ff))
        transcode_logs.sort(reverse=True)
        return {
            'server': config.tail_log_paths,
            'playback': playback_logs,
            'transcode': transcode_logs
        }

    @router.get('/log', tags=['Job'])
    def get_log(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        log_index: int=None,
        transcode_log_path: str=None
    ):
        log_path = None
        if log_index != None:
            log_path = config.tail_log_paths[log_index]
        if transcode_log_path:
            if config.transcode_log_dir in transcode_log_path:
                log_path = transcode_log_path
            else:
                return f'Log path [{transcode_log_path}] not found in [{config.transcode_log_dir}]'
        if not log_path:
            return 'Log path not found'
        with open(log_path,'r') as read_handle:
            lines = read_handle.readlines()
            lines.reverse()
            lines = lines[:150]
            return '\n'.join(lines)

    @router.get("/shelf/list",tags=['Shelf'])
    def get_shelf_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_shelf_list(ticket=auth_user.ticket)

    @router.get("/shelf",tags=['Shelf'])
    def get_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
    ):
        if not auth_user.ticket.is_allowed(shelf_id=shelf_id):
            return None
        return db.op.get_shelf_by_id(shelf_id=shelf_id)

    @router.post("/shelf",tags=['Shelf'])
    def save_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf: am.Shelf,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_shelf(shelf=shelf)

    @router.post("/shelf/watched/toggle",tags=['Shelf'])
    def toggle_shelf_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_shelf_id: int=None,
        show_shelf_id: int=None
    ):
        if movie_shelf_id:
            is_watched = db.op.get_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id
            )
            db.op.set_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id,
                is_watched=not is_watched
            )
            return not is_watched
        if show_shelf_id:
            is_watched = db.op.get_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id
            )
            db.op.set_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id,
                is_watched = not is_watched
            )
            return not is_watched

    @router.post("/shelf/watched",tags=['Shelf'])
    def set_shelf_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_shelf_id: int=None,
        show_shelf_id: int=None,
        is_watched: bool=False
    ):
        if movie_shelf_id:
            return db.op.set_movie_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=movie_shelf_id,
                is_watched=is_watched
            )
        if show_shelf_id:
            return db.op.set_show_shelf_watched(
                ticket=auth_user.ticket,
                shelf_id=show_shelf_id,
                is_watched = is_watched
            )


    @router.delete("/shelf/{shelf_id}",tags=['Shelf'])
    def delete_shelf(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_shelf_by_id(shelf_id=shelf_id)

    @router.post("/user",tags=['User'])
    def save_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user: am.User,
    ):
        return db.op.upsert_user(user=user)

    @router.get('/user',tags=['User'])
    def get_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_id: int
    ):
        return db.op.get_user_by_id(user_id=user_id)

    @router.delete("/user/{user_id}",tags=['User'])
    def delete_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_id: int,
    ):
        if not auth_user.is_admin():
            return None
        return db.op.delete_user_by_id(user_id=user_id)

    @router.post('/user/access',tags=['User'])
    def save_user_access(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        user_access: am.UserAccess
    ):
        if not auth_user.is_admin():
            return None
        return db.op.save_user_access(user_access=user_access)

    @router.get('/search', tags=['User'])
    def perform_search(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        query:str
    ):
        return db.op.perform_search(ticket=auth_user.ticket,query=query)

    @router.get('/tag',tags=['Tag'])
    def get_user(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id: int
    ):
        if not auth_user.ticket.is_allowed(tag_id=tag_id):
            return None
        return db.op.get_tag_by_id(tag_id=tag_id)

    @router.get('/tag/list',tags=['Tag'])
    def get_tag_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_tag_list(ticket=auth_user.ticket)

    @router.post('/tag',tags=['Tag'])
    def save_tag(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag: am.Tag
    ):
        if not auth_user.is_admin():
            return None
        return db.op.upsert_tag(tag)

    @router.delete('/tag/{tag_id}',tags=['Tag'])
    def delete_tag(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id:int
    ):
        if not auth_user.is_admin():
            return None
        return db.delete_tag_by_id(tag_id=tag_id)

    @router.get("/playlist/list",tags=['Tag'])
    def get_playlist_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_playlist_list(ticket=auth_user.ticket)

    @router.get("/playlist",tags=['Tag'])
    def get_playlist_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        tag_id: int
    ):
        return db.op.get_playlist_by_tag_id(ticket=auth_user.ticket,tag_id=tag_id)


    @router.get("/movie/list",tags=['Movie'])
    def get_movie_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_playlisted:bool=True
    ):
        return db.op.get_movie_list(
            ticket=auth_user.ticket,
            shelf_id=shelf_id,
            show_playlisted=show_playlisted,
            load_files=False
        )

    @router.get("/movie",tags=['Movie'])
    def get_movie_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id: int,
        device_profile:str,
    ):
        movie = db.op.get_movie_by_id(ticket=auth_user.ticket,movie_id=movie_id)
        if movie == None:
            return None
        movie.shelf_name = movie.shelf.name
        movie.watched = db.op.get_movie_watched(ticket=auth_user.ticket,movie_id=movie_id)
        movie.has_extras = False
        movie.has_versions = False

        for ii in range(0,len(movie.video_files)):
            movie.video_files[ii].info = json.loads(movie.video_files[ii].snowstream_info_json)
            del movie.video_files[ii].snowstream_info_json
            if device_profile:
                plan = snow_media.planner.create_plan(device_profile=device_profile,snowstream_info=movie.video_files[ii].info)
                movie.video_files[ii].plan = plan
            movie.video_files[ii].file_index = ii
            if 'main_feature' in movie.video_files[ii].kind:
                movie.main_feature_index = ii
            if 'extra' in movie.video_files[ii].kind:
                movie.has_extras = True
                movie.video_files[ii].is_extra = True
            if movie.video_files[ii].version:
                movie.has_versions = True
        search_query = f'reddit movies discussion {movie.name} ({movie.release_year})'
        movie.discussion_image_url = util.search_to_base64_qrcode(search_query)
        return movie

    @router.post("/movie/watched",tags=['Movie'])
    def set_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int,
        is_watched:bool=True
    ):
        return db.op.set_movie_watched(
            ticket=auth_user.ticket,
            movie_id=movie_id,
            is_watched=is_watched
        )

    @router.post("/movie/watched/toggle",tags=['Movie'])
    def toggle_movie_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        is_watched = db.op.get_movie_watched(
            ticket=auth_user.ticket,
            movie_id=movie_id
        )
        db.op.set_movie_watched(
            ticket=auth_user.ticket,
            movie_id=movie_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.post("/movie/watch_count",tags=['Movie'])
    def increase_movie_watch_count(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        movie_id:int
    ):
        return db.op.increase_movie_watch_count(ticket=auth_user.ticket, movie_id=movie_id)

    @router.post("/movie/progress",tags=['Movie'])
    def set_movie_watch_progress(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        watch_progress: am.WatchProgress
    ):
        return db.op.set_movie_watch_progress(ticket=auth_user.ticket,watch_progress=watch_progress)

    @router.get("/show/list",tags=['Show'])
    def get_show_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_playlisted:bool=True
    ):
        return db.op.get_show_list_by_shelf(
            ticket=auth_user.ticket,
            shelf_id=shelf_id,
            show_playlisted=show_playlisted
        )

    @router.post("/show/watched",tags=['Show'])
    def set_show_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id,
            is_watched=is_watched
        )


    @router.post("/show/watched/toggle",tags=['Show'])
    def toggle_show_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int
    ):
        is_watched = db.op.get_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id
        )
        db.op.set_show_watched(
            ticket=auth_user.ticket,
            show_id=show_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/season/list",tags=['Show'])
    def get_show_season_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id: int
    ):
        return db.op.get_show_season_list_by_show_id(
            ticket=auth_user.ticket,
            show_id=show_id
        )

    @router.post("/show/season/watched",tags=['Show'])
    def set_show_season_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        season_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id,
            is_watched=is_watched
        )

    @router.post("/show/season/watched/toggle",tags=['Show'])
    def toggle_show_season_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        season_id:int
    ):
        is_watched = db.op.get_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id
        )
        db.op.set_show_season_watched(
            ticket=auth_user.ticket,
            season_id=season_id,
            is_watched=not is_watched
        )
        return not is_watched

    @router.get("/show/season/episode/list",tags=['Show'])
    def get_show_season_episode_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id: int,
        show_season_id: int
    ):
        return db.op.get_show_episode_list(ticket=auth_user.ticket,shelf_id=shelf_id,show_season_id=show_season_id,include_specials=True)

    @router.post("/show/season/episode/watched",tags=['Show'])
    def set_show_episode_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id:int,
        is_watched:bool=True
    ):
        return db.op.set_show_episode_watched(
            ticket=auth_user.ticket,
            episode_id=episode_id,
            is_watched=is_watched
        )

    @router.post("/show/season/episode/watched/toggle",tags=['Show'])
    def toggle_show_episode_watched(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id:int
    ):
        episode = db.op.get_show_episode_by_id(ticket=auth_user.ticket,episode_id=episode_id)
        db.op.set_show_episode_watched(
            ticket=auth_user.ticket,
            episode_id=episode_id,
            is_watched=not episode.watched
        )
        return not episode.watched

    @router.post("/show/season/episode/watch_count",tags=['Show'])
    def increase_show_episode_watch_count(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_episode_id:int
    ):
        return db.op.increase_show_episode_watch_count(ticket=auth_user.ticket,show_episode_id=show_episode_id)

    @router.get("/show/season/episode",tags=['Show'])
    def get_show_episode_details(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        episode_id: int,
        device_profile: str
    ):
        episode = db.op.get_show_episode_by_id(ticket=auth_user.ticket,episode_id=episode_id)
        if not episode:
            return None
        episode.shelf_name = episode.season.show.shelf.name
        episode.has_extras = False
        episode.has_versions = False
        for ii in range(0,len(episode.video_files)):
            episode.video_files[ii].info = json.loads(episode.video_files[ii].snowstream_info_json)
            del episode.video_files[ii].snowstream_info_json
            if device_profile:
                plan = snow_media.planner.create_plan(device_profile=device_profile,snowstream_info=episode.video_files[ii].info)
                episode.video_files[ii].plan = plan
            episode.video_files[ii].file_index = ii
            if episode.video_files[ii].version:
                episode.has_versions = True
        anime_query = " anime" if episode.video_files[ii].info["is_anime"] else ""
        search_query = f'reddit discussion{anime_query} {episode.season.show.name} season {episode.season.season_order_counter} episode {episode.episode_order_counter}'
        episode.discussion_image_url = util.search_to_base64_qrcode(search_query)
        return episode

    @router.post("/show/season/episode/progress",tags=['Show'])
    def set_show_episode_watch_progress(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        watch_progress: am.WatchProgress
    ):
        return db.op.set_show_episode_watch_progress(ticket=auth_user.ticket,watch_progress=watch_progress)

    @router.get('/keepsake')
    def get_keepsake(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        shelf_id:str = None,
        subdirectory64:str = None
    ):
        shelf = db.op.get_shelf_by_id(shelf_id=shelf_id)
        absolute_subdirectory = shelf.local_path
        if subdirectory64:
            absolute_subdirectory = util.fromBase64(subdirectory64)
        keepsakes = db.op.get_keepsake_list_by_directory(directory=absolute_subdirectory)
        images = []
        videos = []
        directories = []
        directory_dedupe = {}
        for keepsake in keepsakes:
            if keepsake.directory == absolute_subdirectory:
                images = keepsake.image_files
                videos = keepsake.video_files
            dir_name = keepsake.directory.replace(absolute_subdirectory,'')
            parts = dir_name.split('/')
            if len(parts) == 1:
                continue
            subdir = parts[1]
            if not subdir in directory_dedupe:
                directory_dedupe[subdir] = True
                directories.append({
                    'display': subdir,
                    'path': os.path.join(absolute_subdirectory,subdir)
                })
        for video in videos:
            video.info = json.loads(video.snowstream_info_json)
            del video.snowstream_info_json
        for image in images:
            image.name = image.local_path.split('/')[-1]
        return {
            'videos': videos,
            'images': images,
            'directories': directories,
            'shelf': shelf
        }

    @router.get('/continue/watching',tags=['User'])
    def get_continue_watching_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        return db.op.get_continue_watching_list(ticket=auth_user.ticket)

    @router.get("/device/profile/list",tags=['User'])
    def get_device_profile_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
    ):
        return {'devices':[xx.name for xx in snow_media.device.device_list]}

    @router.post("/transcode/session",tags=['User'])
    def create_transcode_session(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        video_file_id:int=None,
        streamable_id:int=None,
        audio_track_index:int=None,
        subtitle_track_index:int=None,
        device_profile:str=None,
        seek_to_seconds:int=None
    ):
        return transcode_sessions.create_session(
            ticket=auth_user.ticket,
            device_profile=device_profile,
            video_file_id=video_file_id,
            streamable_id=streamable_id,
            audio_track_index=audio_track_index,
            subtitle_track_index=subtitle_track_index,
            seek_to_seconds=seek_to_seconds
        )

    @router.get("/session/list",tags=['User'])
    def get_session_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        transcodes = db.op.get_transcode_session_list()
        return {
            'transcodes': transcodes
        }

    @router.delete("/transcode/session",tags=['Unauthed Video'])
    def close_transcode_session(transcode_session_id:int=None):
        if transcode_session_id == None:
            transcode_sessions.cleanup()
        else:
            transcode_sessions.close(transcode_session_id=transcode_session_id)
        return True

    @router.get("/playing/queue",tags=['User'])
    def get_playing_queue(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        show_id:int=None,
        show_season_id:int=None,
        tag_id:int=None,
        shuffle:bool=False,
        source:str=None
    ):
        return db.op.get_playing_queue(
            ticket=auth_user.ticket,
            show_id=show_id,
            show_season_id=show_season_id,
            tag_id=tag_id,
            shuffle=shuffle,
            source=source
        )

    @router.post('/playing/queue',tags=['User'])
    def update_playing_queue(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        source:str,
        progress:int
    ):
        db.op.update_playing_queue(ticket=auth_user.ticket,source=source,progress=progress)
        return db.op.get_playing_queue(ticket=auth_user.ticket,source=source)

    @router.delete('/cached/text', tags=['Admin'])
    def delete_all_cached_text(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        if not auth_user.is_admin():
            return False
        db.op.delete_all_cached_text()
        return True

    @router.post('/display-cleanup-rule', tags=['Admin'])
    def save_dipslay_cleanup_rule(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        rule: am.DisplayCleanupRule
    ):
        if not auth_user.is_admin():
            return False
        if rule.id != None:
            return db.op.update_display_cleanup_rule(
                rule_id=rule.id,
                priority=rule.priority,
                rule_kind=rule.rule_kind,
                target_kind=rule.target_kind,
                needle=rule.needle,
                replacement=rule.replacement
            )
        return db.op.create_display_cleanup_rule(
            priority=rule.priority,
            rule_kind=rule.rule_kind,
            target_kind=rule.target_kind,
            needle=rule.needle,
            replacement=rule.replacement
        )

    @router.get('/display-cleanup-rule', tags=['Admin'])
    def get_display_cleanup_rule(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        rule_id:int
    ):
        if not auth_user.is_admin():
            return False
        return db.op.get_display_cleanup_rule(rule_id=rule_id)

    @router.delete('/display-cleanup-rule', tags=['Admin'])
    def delete_display_cleanup_rule(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
        rule_id:int
    ):
        if not auth_user.is_admin():
            return False
        return db.op.delete_display_cleanup_rule(rule_id=rule_id)

    @router.get('/display-cleanup-rule/list', tags=['Admin'])
    def get_display_cleanup_rule_list(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])]
    ):
        if not auth_user.is_admin():
            return None
        return db.op.get_display_cleanup_rule_list()

    @router.post('/hotfix', tags=['Admin'])
    def deployment_hotfix(
        auth_user: Annotated[am.User, Security(get_current_user, scopes=[])],
    ):
        #db.sql.truncate('streamable')
        #db.sql.truncate('cached_text')
        return True

        # return db.op.fix_image_file_thumbnail_paths()

        #episodes = db.op.get_show_episode_list(ticket=auth_user.ticket,include_specials=True,load_episode_files=False)
        #special_ids = [xx.id for xx in episodes if xx.season.season_order_counter == 0]
        #db.op.set_show_episode_list_watched(auth_user.ticket,special_ids)
        #return {'episodes': len(special_ids)}

    return router


def no_auth_required(router):
    @router.get("/heartbeat",tags=['Unauthed'])
    def heartbeat():
        return {"alive": True}

    @router.get("/info",tags=['Unauthed'])
    def info():
        return {
            "serverVersion": config.server_version,
            "serverBuildDate": config.server_build_date,
        }

    @router.get("/password/hash",tags=['Unauthed'])
    def password_hash(password: str):
        return util.get_password_hash(password)


    @router.get("/user/list",tags=['Unauthed'])
    def get_user_list(device_profile:str=None):
        device = snow_media.device.get_device(device_profile)
        users = db.op.get_user_list()
        results = []
        admin = None
        for user in users:
            user.hashed_password = None
            if user.username == 'admin':
                admin = user
            else:
                if not device.require_password:
                    user.has_password = False
                results.append(user)
        results.append(admin)

        return results

    @router.get("/streamable.m3u", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_m3u():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_M3U)

    @router.get("/streamable.xml", response_class=PlainTextResponse,tags=['Unauthed Video'])
    def get_streamable_epg():
        return db.op.get_cached_text_by_key(key=cache.key.STREAMABLE_EPG)

    @router.get("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    @router.head("/transcode/playlist.m3u8",tags=['Unauthed Video'])
    def get_transcode_playlist(transcode_session_id:int):
        playlist_content = transcode_sessions.get_playlist_content(transcode_session_id=transcode_session_id)
        return Response(playlist_content, status_code=200, media_type="video/mp4")

    @router.get("/transcode/segment",tags=['Unauthed Video'])
    @router.head("/transcode/segment",tags=['Unauthed Video'])
    def get_transcode_file_segment(transcode_session_id: int, segment_file: str):
        segment = transcode_sessions.get_stream_segment(
            transcode_session_id=transcode_session_id, segment_file=segment_file
        )
        return Response(segment, status_code=200, media_type="video/mp4")

    async def webhook(kind:str, request:Request):
        headers = dict(request.headers)
        if not 'apikey' in headers or headers['apikey'] != 'scanner':
            return False
        body = await request.json()
        is_show = kind == 'show' and 'series' in body and 'path' in body['series']
        is_movie = kind == 'movie' and 'movie' in body and 'folderPath' in body['movie']
        if is_movie or is_show:
            metadata_id = None
            directory = None
            if is_show:
                directory = body['series']['path']
                if 'testpath' in directory:
                    return True
                if 'tvdbId' in body['series'] and body['series']['tvdbId'] != None:
                    metadata_id = int(body['series']['tvdbId'])
            else:
                directory = body['movie']['folderPath']
                if 'testpath' in directory:
                    return True
                if 'tmdbId' in body['movie'] and body['movie']['tmdbId'] != None:
                    metadata_id = int(body['movie']['tmdbId'])
            input = {
                'target_kind': 'directory',
                'target_directory': directory,
            }
            if metadata_id:
                input['metadata_id'] = metadata_id
                input['spawn_subjob'] = 'update_media_files'
            scan_job = db.op.create_job(kind='scan_shelves_content',input=input)
            message.write.send(job_id=scan_job.id, kind='scan_shelves_content', input=input)
        else:
            log.info("Unable to process webhook")
            log.info("Header")
            log.info(json.dumps(headers,indent=4))
            log.info("Body")
            log.info(json.dumps(body,indent=4))
            return False

    # https://github.com/Sonarr/Sonarr/blob/14e324ee30694ae017a39fd6f66392dc2d104617/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/sonarr", tags=['Unauthed'])
    async def hook_sonarr(request:Request):
        return await webhook(kind='show', request=request)

    # https://github.com/Radarr/Radarr/blob/159f5df8cca6704fe88da42d2b20d1f39f0b9d59/src/NzbDrone.Core/Notifications/Webhook/WebhookBase.cs#L32
    @router.post("/hook/radarr", tags=['Unauthed'])
    async def hook_radarr(request:Request):
        return await webhook(kind='movie', request=request)

    return router
