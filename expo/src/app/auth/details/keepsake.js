import C from '../../../common'

const styles = {
    modal: {
        flex: 1,
        padding: 10,
        backgroundColor: C.StaticStyle.color.background
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
                            <C.SnowVideoPlayer
                                videoUrl={zoomedItem.web_path}
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
                modalContent = <C.SnowVideoPlayer
                    videoUrl={zoomedItem.web_path}
                />
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
    if (keepsake.video_files) {
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
    if (keepsake.image_files) {
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
