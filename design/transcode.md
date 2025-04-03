# Thoughts on v2

 1. Allow different users to stream the same file at different settings?
 2. Transcode will always change the underlying video/audio codec.
   a) Otherwise rely on direct access to a resource
 3. Settings to change the codec used (for when using nvidia vs intel etc)
 4. Move transcode sessions into the database

What if instead of serving files over SMB or FTP, have each media server host them via HTTP from a local nginx 
That nginx server could be configured to allow rtmp restreams.
Push transcodes up to those.
Maybe host a loval restream in the docker container for non-media server hosted sources, like Frigate

# Local FFMPEG Streaming tests

## Host the rtmp stream locally (working !)
`ffmpeg  -i "${INPUT_VIDEO}" -c:v h264_nvenc -preset medium -vf "bwdif,format=yuv420p" -c:a aac -f flv -listen 1 rtmp://0.0.0.0:1935/hls/abom`

## best? Host an repackage the stream locally (also working) (but only if subtitle source isn't image based)
`ffmpeg  -i "${INPUT_VIDEO}" -c:v copy -c:a aac -c:s mov_text -f flv -listen 1 rtmp://0.0.0.0:1935/hls/abom`

## Hard sub image subtitles
`ffmpeg  -i "${INPUT_VIDEO}" -c:v h264_nvenc -filter_complex "[0:v][0:s]overlay[v]" -c:a aac -map "[v]" -map 0:a:0 -f flv -listen 1 rtmp://0.0.0.0:1935/hls/abom`

# Resources

https://dev.to/samuyi/how-to-setup-nginx-for-hls-video-streaming-on-centos-7-3jb8

https://www.digitalocean.com/community/tutorials/how-to-set-up-a-video-streaming-server-using-nginx-rtmp-on-ubuntu-20-04

https://github.com/bluenviron/mediamtx

https://www.reddit.com/r/ffmpeg/comments/royan4/how_do_media_centers_like_emby_achieve_video/

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