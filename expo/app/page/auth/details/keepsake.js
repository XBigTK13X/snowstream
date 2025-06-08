import C from '../../../common'

const styles = {
    modal: {
        flex: 1,
        padding: 10,
        backgroundColor: 'black'
    },
    zoomedImage: {
        flex: 1
    }
}

export default function KeepsakeDetailsPage() {
    const localParams = C.useLocalSearchParams()

    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
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
        if (zoomedItem.model_kind === 'image_file') {
            let imageUrl = zoomedItem.web_path
            if (C.Platform.OS == 'web') {
                // Full size images cause the app to crash on web!?!?
                imageUrl = zoomedItem.thumbnail_web_path
            }
            modalContent = <C.Image
                style={styles.zoomedImage}
                resizeMode="contain"
                source={{ uri: imageUrl }} />
        } else {
            modalContent = <C.SnowVideoPlayer
                videoUrl={zoomedItem.web_path}
            />
        }
        return (
            <C.Modal
                onRequestClose={closeModal}
            >
                <C.TouchableOpacity
                    onPress={closeModal}
                    style={styles.modal}>
                    {modalContent}
                </C.TouchableOpacity>
            </C.Modal>
        )
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
