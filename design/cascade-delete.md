# Fixing cascading deletes

Back when I was setting up snowstream, I didn't know I had to manually configure cascading deletes outside of the ORM layer.

snowstream=# SELECT
    tc.table_schema,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
 table_schema |                 constraint_name                  |         table_name         |      column_name      | foreign_table_schema | foreign_table_name | foreign_column_name
--------------+--------------------------------------------------+----------------------------+-----------------------+----------------------+--------------------+---------------------
 public       | streamable_stream_source_id_fkey                 | streamable                 | stream_source_id      | public               | stream_source      | id
 public       | streamable_schedule_channel_id_fkey              | streamable_schedule        | channel_id            | public               | streamable_channel | id
 public       | video_file_shelf_id_fkey                         | video_file                 | shelf_id              | public               | shelf              | id
 public       | movie_tag_tag_id_fkey                            | movie_tag                  | tag_id                | public               | tag                | id
 public       | movie_tag_movie_id_fkey                          | movie_tag                  | movie_id              | public               | movie              | id
 public       | movie_shelf_shelf_id_fkey                        | movie_shelf                | shelf_id              | public               | shelf              | id
 public       | movie_shelf_movie_id_fkey                        | movie_shelf                | movie_id              | public               | movie              | id
 public       | movie_video_file_movie_id_fkey                   | movie_video_file           | movie_id              | public               | movie              | id
 public       | movie_video_file_video_file_id_fkey              | movie_video_file           | video_file_id         | public               | video_file         | id
 public       | show_shelf_shelf_id_fkey                         | show_shelf                 | shelf_id              | public               | shelf              | id
 public       | show_shelf_show_id_fkey                          | show_shelf                 | show_id               | public               | show               | id
 public       | show_tag_tag_id_fkey                             | show_tag                   | tag_id                | public               | tag                | id
 public       | show_tag_show_id_fkey                            | show_tag                   | show_id               | public               | show               | id
 public       | show_season_show_id_fkey                         | show_season                | show_id               | public               | show               | id
 public       | show_season_tag_tag_id_fkey                      | show_season_tag            | tag_id                | public               | tag                | id
 public       | show_season_tag_show_season_id_fkey              | show_season_tag            | show_season_id        | public               | show_season        | id
 public       | show_episode_show_season_id_fkey                 | show_episode               | show_season_id        | public               | show_season        | id
 public       | show_episode_tag_tag_id_fkey                     | show_episode_tag           | tag_id                | public               | tag                | id
 public       | show_episode_tag_show_episode_id_fkey            | show_episode_tag           | show_episode_id       | public               | show_episode       | id
 public       | show_episode_video_file_show_episode_id_fkey     | show_episode_video_file    | show_episode_id       | public               | show_episode       | id
 public       | show_episode_video_file_video_file_id_fkey       | show_episode_video_file    | video_file_id         | public               | video_file         | id
 public       | stream_source_tag_tag_id_fkey                    | stream_source_tag          | tag_id                | public               | tag                | id
 public       | stream_source_tag_stream_source_id_fkey          | stream_source_tag          | stream_source_id      | public               | stream_source      | id
 public       | streamable_tag_tag_id_fkey                       | streamable_tag             | tag_id                | public               | tag                | id
 public       | streamable_tag_streamable_id_fkey                | streamable_tag             | streamable_id         | public               | streamable         | id
 public       | image_file_shelf_id_fkey                         | image_file                 | shelf_id              | public               | shelf              | id
 public       | movie_image_file_movie_id_fkey                   | movie_image_file           | movie_id              | public               | movie              | id
 public       | movie_image_file_image_file_id_fkey              | movie_image_file           | image_file_id         | public               | image_file         | id
 public       | show_episode_image_file_show_episode_id_fkey     | show_episode_image_file    | show_episode_id       | public               | show_episode       | id
 public       | show_episode_image_file_image_file_id_fkey       | show_episode_image_file    | image_file_id         | public               | image_file         | id
 public       | show_season_image_file_show_season_id_fkey       | show_season_image_file     | show_season_id        | public               | show_season        | id
 public       | show_season_image_file_image_file_id_fkey        | show_season_image_file     | image_file_id         | public               | image_file         | id
 public       | show_image_file_show_id_fkey                     | show_image_file            | show_id               | public               | show               | id
 public       | show_image_file_image_file_id_fkey               | show_image_file            | image_file_id         | public               | image_file         | id
 public       | metadata_file_shelf_id_fkey                      | metadata_file              | shelf_id              | public               | shelf              | id
 public       | movie_metadata_file_movie_id_fkey                | movie_metadata_file        | movie_id              | public               | movie              | id
 public       | movie_metadata_file_metadata_file_id_fkey        | movie_metadata_file        | metadata_file_id      | public               | metadata_file      | id
 public       | show_episode_metadata_file_show_episode_id_fkey  | show_episode_metadata_file | show_episode_id       | public               | show_episode       | id
 public       | show_episode_metadata_file_metadata_file_id_fkey | show_episode_metadata_file | metadata_file_id      | public               | metadata_file      | id
 public       | show_season_metadata_file_show_season_id_fkey    | show_season_metadata_file  | show_season_id        | public               | show_season        | id
 public       | show_season_metadata_file_metadata_file_id_fkey  | show_season_metadata_file  | metadata_file_id      | public               | metadata_file      | id
 public       | show_metadata_file_show_id_fkey                  | show_metadata_file         | show_id               | public               | show               | id
 public       | show_metadata_file_metadata_file_id_fkey         | show_metadata_file         | metadata_file_id      | public               | metadata_file      | id
 public       | user_tag_user_id_fkey                            | user_tag                   | user_id               | public               | snowstream_user    | id
 public       | user_tag_tag_id_fkey                             | user_tag                   | tag_id                | public               | tag                | id
 public       | user_shelf_user_id_fkey                          | user_shelf                 | user_id               | public               | snowstream_user    | id
 public       | user_shelf_shelf_id_fkey                         | user_shelf                 | shelf_id              | public               | shelf              | id
 public       | user_stream_source_user_id_fkey                  | user_stream_source         | user_id               | public               | snowstream_user    | id
 public       | user_stream_source_stream_source_id_fkey         | user_stream_source         | stream_source_id      | public               | stream_source      | id
 public       | client_device_user_client_device_id_fkey         | client_device_user         | client_device_id      | public               | client_device      | id
 public       | client_device_user_user_id_fkey                  | client_device_user         | user_id               | public               | snowstream_user    | id
 public       | watch_progress_client_device_user_id_fkey        | watch_progress             | client_device_user_id | public               | client_device_user | id
 public       | watch_progress_movie_id_fkey                     | watch_progress             | movie_id              | public               | movie              | id
 public       | watch_progress_show_episode_id_fkey              | watch_progress             | show_episode_id       | public               | show_episode       | id
 public       | watch_progress_streamable_id_fkey                | watch_progress             | streamable_id         | public               | streamable         | id
 public       | watch_count_client_device_user_id_fkey           | watch_count                | client_device_user_id | public               | client_device_user | id
 public       | watch_count_movie_id_fkey                        | watch_count                | movie_id              | public               | movie              | id
 public       | watch_count_show_episode_id_fkey                 | watch_count                | show_episode_id       | public               | show_episode       | id
 public       | watch_count_streamable_id_fkey                   | watch_count                | streamable_id         | public               | streamable         | id
 public       | watched_client_device_user_id_fkey               | watched                    | client_device_user_id | public               | client_device_user | id
 public       | watched_movie_id_fkey                            | watched                    | movie_id              | public               | movie              | id
 public       | watched_show_episode_id_fkey                     | watched                    | show_episode_id       | public               | show_episode       | id
 public       | watched_streamable_id_fkey                       | watched                    | streamable_id         | public               | streamable         | id
 public       | transcode_session_client_device_user_id_fkey     | transcode_session          | client_device_user_id | public               | client_device_user | id
 public       | transcode_session_video_file_id_fkey             | transcode_session          | video_file_id         | public               | video_file         | id
 public       | transcode_session_streamable_id_fkey             | transcode_session          | streamable_id         | public               | streamable         | id
 public       | playing_queue_client_device_user_id_fkey         | playing_queue              | client_device_user_id | public               | client_device_user | id
 public       | keepsake_shelf_shelf_id_fkey                     | keepsake_shelf             | shelf_id              | public               | shelf              | id
 public       | keepsake_shelf_keepsake_id_fkey                  | keepsake_shelf             | keepsake_id           | public               | keepsake           | id
 public       | keepsake_video_file_keepsake_id_fkey             | keepsake_video_file        | keepsake_id           | public               | keepsake           | id
 public       | keepsake_video_file_video_file_id_fkey           | keepsake_video_file        | video_file_id         | public               | video_file         | id
 public       | keepsake_image_file_keepsake_id_fkey             | keepsake_image_file        | keepsake_id           | public               | keepsake           | id
 public       | keepsake_image_file_image_file_id_fkey           | keepsake_image_file        | image_file_id         | public               | image_file         | id