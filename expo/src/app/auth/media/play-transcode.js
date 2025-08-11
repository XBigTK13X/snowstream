let shouldTranscode = false
if (localParams.transcode) {
    shouldTranscode = localParams.transcode
}
if (clientOptions.alwaysTranscode) {
    shouldTranscode = true
}
const [transcode, setTranscode] = C.React.useState(shouldTranscode)
const [transcodeReady, setTranscodeReady] = C.React.useState(false)

apiClient.createVideoFileTranscodeSession(
    videoFile.id,
    audioTrackIndex,
    subtitleTrackIndex
).then((transcodeSession) => {
    if (transcodeSession) {
        setVideoUrl(transcodeSession.transcode_url)
        setTranscodeReady(true)
        setVideoIsHdr(videoFile.is_hdr)
    }
    else {
        setPlaybackFailed("Unable to create a transcode session")
    }
})

apiClient.getStreamable(streamableId).then((response) => {
    if (transcode) {
        apiClient.createStreamableTranscodeSession(streamableId).then((transcodeSession) => {
            if (transcodeSession) {
                setVideoUrl(transcodeSession.transcode_url)
                setTranscodeReady(true)
            }
            else {
                setPlaybackFailed("Unable to create a transcode session")
            }
        })
    } else {
        if (response.duration_seconds) {
            setDurationSeconds(response.duration_seconds)
        }
        setVideoUrl(response.url)
    }
    setVideoTitle(response.name)
})

if (transcode && !transcodeReady) {
    return (
        <C.View>
            <C.SnowText>Snowstream is preparing a server-side transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        </C.View>
    )
}