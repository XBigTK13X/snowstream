# Thoughts on v2

 1. Allow different users to stream the same file at different settings?
 2. Transcode will always change the underlying video/audio codec.
   a) Otherwise rely on direct access to a resource
 3. Settings to change the codec used (for when using nvidia vs intel etc)
 4. Move transcode sessions into the database

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