import C from '../../../common'

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
        }}
        onStopVideo={() => {
            return props.closeModal()
        }}>
        <VideoPlayer />
    </C.PlayerContextProvider>
    )
}

export default function KeepsakeDetailsPage(props) {
    const { SnowStyle } = C.useStyleContext(props)
    const localParams = C.useLocalSearchParams()

    const { apiClient, routes } = C.useAppContext()
    const [keepsake, setKeepsake] = C.React.useState(null)
    const [zoomedItem, setZoomedItem] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!keepsake) {
            apiClient.getKeepsake(localParams.shelfId, localParams.subdirectory).then((response) => {
                setKeepsake(response)
            })
        }
    })

    const styles = {
        modal: {
            flex: 1,
            padding: 10,
            backgroundColor: SnowStyle.color.background
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
        let subdir = ''
        if (localParams.subdirectory) {
            subdir = ` subdirectory [${localParams.subdirectory}]`
        }
        return <C.Text>Loading keepsakes from shelf {localParams.shelfId}.</C.Text>
    }

    let videos = null
    if (keepsake.videos && keepsake.videos.length) {
        videos = (
            <C.View>
                <C.SnowLabel>Videos</C.SnowLabel>
                <C.SnowGrid wide={true}>
                    {keepsake.videos.map((video, videoIndex) => {
                        return (
                            <C.SnowImageButton
                                wide={true}
                                key={videoIndex}
                                title={video.name}
                                imageUrl={video.thumbnail_web_path}
                                onPress={() => { setZoomedItem(video) }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </C.View>
        )
    }
    let images = null
    if (keepsake.images && keepsake.images.length) {
        images = (
            <C.View>
                <C.SnowLabel>Images</C.SnowLabel>
                <C.SnowGrid wide={true}>
                    {keepsake.images.map((image, imageIndex) => {
                        return (
                            <C.SnowImageButton
                                wide={true}
                                shouldFocus={itemIndex === 0}
                                key={imageIndex}
                                title={image.name}
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
    if (keepsake.directories && keepsake.directories.length) {
        dirs = (
            <C.View>
                <C.SnowLabel>Directories</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.directories.map((dir, dirIndex) => {
                        return (
                            <C.SnowTextButton
                                tall
                                title={dir.display}
                                key={dirIndex}
                                onPress={() => {
                                    routes.goto(routes.keepsakeDetails, { shelfId: localParams.shelfId, subdirectory: dir.path })
                                }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </C.View>
        )
    }
    if (keepsake) {
        return (
            <C.FillView>
                {videos}
                {images}
                {dirs}
            </C.FillView>
        )
    }
}