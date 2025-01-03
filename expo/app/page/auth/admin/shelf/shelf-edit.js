import C from '../../../../common'

export default function LandingPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()
    const [shelfName, setShelfName] = C.React.useState('')
    const [localPath, setLocalPath] = C.React.useState('')
    const [networkPath, setNetworkPath] = C.React.useState('')
    const [shelfKind, setShelfKind] = C.React.useState('Movies')
    const [shelfKindIndex, setShelfKindIndex] = C.React.useState(0)
    const [shelfId, setShelfId] = C.React.useState(null)
    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!shelfId && localParams.shelfId) {
            apiClient.getShelf(localParams.shelfId).then((shelf) => {
                setShelfId(shelf.id)
                setShelfKind(shelf.kind)
                setShelfKindIndex(shelf.kind == 'Movies' ? 0 : 1)
                setLocalPath(shelf.directory)
                setShelfName(shelf.name)
                setNetworkPath(shelf.direct_stream_url || '')
                //TODO setup network paths
            })
        }
    })
    const chooseShelfKind = (chosenKindIndex) => {
        if (!chosenKindIndex) {
            setShelfKind('Movies')
            setShelfKindIndex(0)
        } else {
            setShelfKind('Shows')
            setShelfKindIndex(1)
        }
    }
    const saveShelf = () => {
        let shelf = {
            id: shelfId,
            kind: shelfKind,
            directory: localPath,
            name: shelfName
        }
        apiClient.saveShelf(shelf)
    }
    return (
        <C.View >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setShelfName} value={shelfName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown options={['Movies', 'Shows']} onChoose={chooseShelfKind} value={shelfKindIndex} />

            <C.SnowLabel>Shelf Local Directory Path</C.SnowLabel>
            <C.SnowInput onChangeText={setLocalPath} value={localPath} />

            <C.SnowLabel>Shelf Network Share Path</C.SnowLabel>
            <C.SnowInput onChangeText={setNetworkPath} value={networkPath} />

            <C.Button title="Save Shelf" onPress={saveShelf} />
        </C.View >
    )
}
