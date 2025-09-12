import C from '../../../common'

const styles = {
    modal: {
        flex: 1,
        padding: 10,
        backgroundColor: C.Style.color.background
    },
    zoomedImage: {
        width: "100%",
        height: 800,
        justifyContent: 'center',
    },
    webImage: {
        flex: 1
    }
}

function VideoPlayer() {
    const player = C.usePlayerContext()
    if (player.info.playbackFailed) {
        return (
            <C.FillView>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {player.info.playbackFailed.message}</C.SnowText>
            </C.FillView>
        )
    }

    if (!player.info.videoUrl) {
        if (player.info.isTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }
    return (
        <C.SnowVideoPlayer />
    )
}

function KeepsakeVideo(props) {
    return (<C.PlayerContextProvider
        forceTranscode={C.isWeb}
        loadVideo={() => {
            return new Promise(resolve => {
                return resolve({
                    url: props.videoFile.network_path,
                    name: props.videoFile.name,
                    durationSeconds: props.videoFile.info.duration_seconds,
                    tracks: props.videoFile.info.tracks
                })
            })
        }}
        loadTranscode={(apiClient, localParams, deviceProfile, initialSeekSeconds) => {
            return new Promise((resolve) => {
                return apiClient.createVideoFileTranscodeSession(
                    props.videoFile.id,
                    0,
                    -1,
                    deviceProfile,
                    initialSeekSeconds ?? 0
                )
                    .then((transcodeSession) => {
                        return resolve({
                            name: props.videoFile.name,
                            url: transcodeSession.transcode_url,
                            durationSeconds: props.videoFile.info.duration_seconds,
                            transcodeId: transcodeSession.transcode_session_id
                        })
                    })
                    .catch((err) => {
                        return resolve({
                            error: err
                        })
                    })
            })
        }}
        onComplete={() => {
            return props.closeModal()
        }}>
        <VideoPlayer />
    </C.PlayerContextProvider>
    )
}

export default function KeepsakeDetailsPage() {
    const localParams = C.useLocalSearchParams()

    const { apiClient, routes } = C.useAppContext()
    const [keepsake, setKeepsake] = C.React.useState(null)
    const [zoomedItem, setZoomedItem] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!keepsake) {
            apiClient.getKeepsake(localParams.keepsakeId).then((response) => {
                setKeepsake(response)
            })
        }
    })

    const closeModal = () => {
        setZoomedItem(null)
    }

    if (zoomedItem) {
        if (zoomedItem.model_kind === 'image_file') {
            return (
                <C.View style={styles.zoomedImage}>
                    <C.TouchableOpacity
                        onPress={closeModal}
                        style={styles.modal}>
                        <C.Image
                            style={styles.webImage}
                            resicontentFitzeMode="contain"
                            source={{ uri: zoomedItem.web_path }} />
                    </C.TouchableOpacity>
                </C.View>)
        }
        return (
            <C.View style={styles.zoomedImage}>
                <C.TouchableOpacity
                    onPress={closeModal}
                    style={styles.modal}>
                    <KeepsakeVideo
                        videoFile={zoomedItem}
                        closeModal={closeModal}
                    />
                </C.TouchableOpacity>
            </C.View>)
    }

    if (!keepsake) {
        return "Loading keepsake"
    }

    let videos = null
    if (keepsake.root.video_files && keepsake.root.video_files.length) {
        videos = (
            <C.View>
                <C.SnowLabel>Videos</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.root.video_files.map((video, videoIndex) => {
                        return (
                            <C.SnowTextButton
                                title={video.name}
                                key={videoIndex}
                                onPress={() => { setZoomedItem(video) }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </C.View>
        )
    }
    let images = null
    if (keepsake.root.image_files && keepsake.root.image_files.length) {
        images = (
            <C.View>
                <C.SnowLabel>Images</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.root.image_files.map((image, imageIndex) => {
                        return (
                            <C.SnowImageButton
                                square
                                key={imageIndex}
                                imageUrl={image.thumbnail_web_path}
                                onPress={() => { setZoomedItem(image) }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </C.View>
        )
    }

    let dirs = null
    if (keepsake.dirs && keepsake.dirs.length) {
        dirs = (
            <C.View>
                <C.SnowLabel>Directories</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.dirs.map((dir, dirIndex) => {
                        return (
                            <C.SnowTextButton
                                title={dir.name}
                                key={dirIndex}
                                onPress={() => {
                                    routes.goto(routes.keepsakeDetails, { keepsakeId: dir.id })
                                }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </C.View>
        )
    }
    if (keepsake && keepsake.root) {
        return (
            <C.View>
                {videos}
                {images}
                {dirs}
            </C.View>
        )
    }
    return <C.Text>Loading keepsake {localParams.keepsakeId}.</C.Text>
}