import { C, useAppContext, Player } from 'snowstream'
import SnowVideoPlayer from '../../../../comp/snow-video-player'

function KeepsakeVideo(props) {
    const player = Player.useSnapshot(Player.state)
    Player.action.setup({
        forceTranscode: C.isWeb,
        loadVideo: () => {
            return new Promise(resolve => {
                return resolve({
                    url: props.videoFile.network_path,
                    name: props.videoFile.name,
                    durationSeconds: props.videoFile.info.duration_seconds,
                    tracks: props.videoFile.info.tracks
                })
            })
        },
        loadTranscode: (apiClient, routeParams, deviceProfile, initialSeekSeconds) => {
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
        },
        onComplete: () => {
            return props.closeModal()
        },
        onStopVideo: () => {
            return props.closeModal()
        }
    })

    if (player.playbackFailed) {
        return (
            <C.FillView>
                <C.SnowText>Unable to play the video.</C.SnowText>
                <C.SnowText>Error: {player.playbackFailed.message}</C.SnowText>
            </C.FillView>
        )
    }

    if (!player.videoUrl) {
        if (player.isTranscode) {
            return <C.SnowText>Preparing a transcode. This can take quite a while to load if subtitles are enabled.</C.SnowText>
        }
        return <C.SnowText>Loading video. This should only take a moment.</C.SnowText>
    }
    return (
        <SnowVideoPlayer />
    )
}

function ZoomView(zoomProps) {
    const { pushModal, popModal, enableOverlay, disableOverlay } = C.useSnowContext()
    C.React.useEffect(() => {
        pushModal({
            props: {
                assignFocus: false,
                wrapper: false,
                onRequestClose: () => { zoomProps.action }
            },
            render: () => {
                return zoomProps.children
            }
        })
        enableOverlay({
            props: {
                focusStart: true,
                focusKey: 'zoomed-item',
                focusLayer: 'zoomed-item',
                onPress: zoomProps.action
            }
        })
        return () => {
            popModal()
            disableOverlay()
        }
    }, [])
    return null
}

export default function KeepsakeDetailsPage(props) {
    const { SnowStyle, navPush, currentRoute } = C.useSnowContext(props)


    const { apiClient, routes } = useAppContext()
    const [keepsake, setKeepsake] = C.React.useState(null)
    const [zoomedItem, setZoomedItem] = C.React.useState(null)

    C.React.useEffect(() => {
        apiClient.getKeepsake(
            currentRoute.routeParams.shelfId,
            currentRoute.routeParams.subdirectory64
        ).then((response) => {
            setKeepsake(response)
        })
    }, [currentRoute])

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
                <ZoomView action={closeModal}>
                    <C.Image
                        style={styles.webImage}
                        contentFit="contain"
                        source={{ uri: zoomedItem.web_path }} />
                </ZoomView>
            )
        }
        return (
            <ZoomView action={closeModal}>
                <KeepsakeVideo
                    videoFile={zoomedItem}
                    closeModal={closeModal}
                />
            </ZoomView>
        )
    }

    if (!keepsake) {
        let subdir = ''
        if (currentRoute.routeParams.subdirectory) {
            subdir = ` subdirectory [${currentRoute.routeParams.subdirectory}]`
        }
        return <C.Text>Loading keepsakes from shelf {currentRoute.routeParams.shelfId}.</C.Text>
    }

    let videos = null
    let hasVideos = keepsake.videos && keepsake.videos.length
    let videoFocusKey = null
    let images = null
    let hasImages = keepsake.images && keepsake.images.length
    let imageFocusKey = null
    let dirs = null
    let hasDirs = keepsake.directories && keepsake.directories.length
    if (hasVideos) {
        videoFocusKey = 'page-entry'
        videos = (
            <>
                <C.SnowLabel>Videos</C.SnowLabel>
                <C.SnowGrid focusStart focusKey={videoFocusKey} wide={true}>
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
            </>
        )
    }

    if (hasImages) {
        imageFocusKey = 'image-list'
        let focus = {}
        if (hasVideos) {
            focus.focusUp = videoFocusKey
        } else {
            focus.focusStart = true
            imageFocusKey = 'page-entry'
        }
        focus.focusKey = imageFocusKey
        images = (
            <>
                <C.SnowLabel>Images</C.SnowLabel>
                <C.SnowGrid {...focus} wide={true}>
                    {keepsake.images.map((image, imageIndex) => {
                        return (
                            <C.SnowImageButton
                                wide={true}
                                key={imageIndex}
                                title={image.name}
                                imageUrl={image.thumbnail_web_path}
                                onPress={() => { setZoomedItem(image) }}
                            />
                        )
                    })}
                </C.SnowGrid>
            </>
        )
    }

    if (hasDirs) {
        let focus = {
            focusKey: 'directory-list'
        }
        if (!hasImages && !hasVideos) {
            focus.focusKey = 'page-entry'
            focus.focusStart = true
        }
        if (hasImages) {
            focus.focusUp = imageFocusKey
        }
        else if (hasVideos) {
            focus.focusUp = videoFocusKey
        }
        dirs = (
            <>
                <C.SnowLabel>Directories</C.SnowLabel>
                <C.SnowGrid {...focus} >
                    {keepsake.directories.map((dir, dirIndex) => {
                        return (
                            <C.SnowTextButton
                                tall
                                title={dir.display}
                                key={dirIndex}
                                onPress={navPush(routes.keepsakeDetails, {
                                    shelfId: currentRoute.routeParams.shelfId,
                                    subdirectory: dir.path,
                                    subdirectory64: C.Snow.toBase64(dir.path),
                                    seekToSeconds: 0
                                }, true)}
                            />
                        )
                    })}
                </C.SnowGrid>
            </>
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