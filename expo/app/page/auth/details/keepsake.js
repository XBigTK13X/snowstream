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

    console.log("Rendering")

    if (zoomedItem) {
        return (
            <C.Modal
                onRequestClose={closeModal}
            >
                <C.TouchableOpacity
                    activeOpacity={1.0}
                    onPress={closeModal}
                    style={styles.modal}>
                    <C.Image
                        style={styles.zoomedImage}
                        resizeMode="contain"
                        source={zoomedItem.web_path} />
                </C.TouchableOpacity>
            </C.Modal>
        )
    }

    if (keepsake) {
        return (
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
        )
    }
    return <C.Text>Loading stream source {localParams.streamSourceId}.</C.Text>
}
