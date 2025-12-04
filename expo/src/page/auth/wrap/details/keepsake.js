import { C, useAppContext } from 'snowstream'
import Player from 'snowstream-player'

export default function KeepsakeDetailsPage(props) {
    const {
        navPush,
        currentRoute,
        pushModal,
        openOverlay,
        clearModals,
        closeOverlay
    } = C.useSnowContext(props)


    const { apiClient, routes } = useAppContext()
    const [keepsake, setKeepsake] = C.React.useState(null)
    const [zoomedItem, setZoomedItem] = C.React.useState(null)

    C.React.useEffect(() => {
        Player.action.reset()
    }, [])

    C.React.useEffect(() => {
        apiClient.getKeepsake(
            currentRoute.routeParams.shelfId,
            currentRoute.routeParams.subdirectory64
        ).then((response) => {
            setKeepsake(response)
        })
    }, [currentRoute])

    const styles = {
        webImage: {
            flex: 1
        }
    }

    const closeModal = () => {
        clearModals()
        closeOverlay()
        setZoomedItem(null)
    }

    C.React.useEffect(() => {
        if (!zoomedItem || zoomedItem.model_kind !== 'image_file') {
            return
        }
        pushModal({
            props: {
                assignFocus: false,
                wrapper: false,
                onRequestClose: closeModal
            },
            render: () => {
                return (
                    <C.Image
                        style={styles.webImage}
                        contentFit="contain"
                        source={{ uri: zoomedItem.web_path }} />
                )
            }
        })
        openOverlay({
            props: {
                focusStart: true,
                focusKey: 'zoomed-item',
                focusLayer: 'zoomed-item',
                onPress: closeModal
            }
        })
        return () => {
            closeOverlay()
        }
    }, [zoomedItem])


    if (!keepsake) {
        let subdir = ''
        if (currentRoute.routeParams.subdirectory) {
            subdir = ` subdirectory [${currentRoute.routeParams.subdirectory}]`
        }
        return <C.Text>Loading keepsakes from shelf {currentRoute.routeParams.shelfId} [{subdir}].</C.Text>
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
                <C.SnowGrid focusStart focusKey={videoFocusKey} itemsPerRow={4} wide={true}>
                    {keepsake.videos.map((video, videoIndex) => {
                        return (
                            <C.SnowImageButton
                                wide={true}
                                key={videoIndex}
                                title={video.name}
                                imageUrl={video.thumbnail_web_path}
                                onPress={navPush({
                                    path: routes.keepsakePlay,
                                    params: {
                                        videoFileId: video.id,
                                        videoUrl: video.network_path,
                                        videoName: video.name,
                                        videoDurationSeconds: video.info.duration_seconds,
                                    }
                                })}
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
                <C.SnowGrid {...focus} itemsPerRow={4} wide={true}>
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
                <C.SnowGrid {...focus} itemsPerRow={4} >
                    {keepsake.directories.map((dir, dirIndex) => {
                        return (
                            <C.SnowTextButton
                                tall
                                title={dir.display}
                                key={dirIndex}
                                onPress={navPush({
                                    path: routes.keepsakeDetails,
                                    params: {
                                        shelfId: currentRoute.routeParams.shelfId,
                                        subdirectory: dir.path,
                                        subdirectory64: C.Snow.toBase64(dir.path),
                                        seekToSeconds: 0
                                    },
                                    replace: false
                                })}
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