# Transcode Schema

- TranscodeSession
  - session_id
  - client device user id
  - video_file_id
  - streamable_id
  - process_id

## Transcode Workflow

FastAPI doesn't guarantee access to shared resources.
Currently transcode is kept in memory in a dict.
Move that info to the database.