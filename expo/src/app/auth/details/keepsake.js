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

    const { apiClient } = C.useAppContext()
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
        let modalContent = null
        // Full size images cause the app to crash on web if they are in a modal
        if (C.isWeb) {
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
            else if (zoomedItem.model_kind === 'video_file') {
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
        }
        else {
            if (zoomedItem.model_kind === 'image_file') {
                modalContent = <C.Image
                    style={styles.zoomedImage}
                    contentFit="contain"
                    source={{ uri: imageUrl }} />
            }
            else if (zoomedItem.model_kind === 'video_file') {
                modalContent = (
                    <KeepsakeVideo
                        videoFile={zoomedItem}
                        closeModal={closeModal}
                    />
                )
            }
        }
        return (
            <C.SnowModal
                onRequestClose={closeModal}
            >
                <C.TouchableOpacity
                    onPress={closeModal}
                    style={styles.modal}>
                    {modalContent}
                </C.TouchableOpacity>
            </C.SnowModal>
        )
    }

    if (!keepsake) {
        return "Loading keepsake"
    }

    let videos = null
    if (keepsake.video_files && keepsake.video_files.length) {
        videos = (
            <C.View>
                <C.SnowLabel>Videos</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.video_files.map((video, videoIndex) => {
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
    if (keepsake.image_files && keepsake.image_files.length) {
        images = (
            <C.View>
                <C.SnowLabel>Images</C.SnowLabel>
                <C.SnowGrid>
                    {keepsake.image_files.map((image, imageIndex) => {
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
    if (keepsake) {
        return (
            <C.View>
                {videos}
                {images}
            </C.View>
        )
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}