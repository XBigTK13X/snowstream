import C from '../../../../common'

export default function ShelfEditPage() {
    const { apiClient } = C.useSession()
    const { routes } = C.useSettings()
    const [shelfName, setShelfName] = C.React.useState('')
    const [localPath, setLocalPath] = C.React.useState('')
    const [networkPath, setNetworkPath] = C.React.useState('')
    const [shelfKind, setShelfKind] = C.React.useState('Movies')
    const [shelfKindIndex, setShelfKindIndex] = C.React.useState(0)
    const [shelfId, setShelfId] = C.React.useState(null)
    const [shelfDeleteCount, setShelfDeleteCount] = C.React.useState(3)
    const [shelfDeleted, setShelfDeleted] = C.React.useState(false)
    const localParams = C.useLocalSearchParams()
    C.React.useEffect(() => {
        if (!shelfId && localParams.shelfId) {
            apiClient.getShelf(localParams.shelfId).then((shelf) => {
                setShelfId(shelf.id)
                setShelfKind(shelf.kind)
                setShelfKindIndex(shelf.kind == 'Movies' ? 0 : 1)
                setLocalPath(shelf.local_path)
                setShelfName(shelf.name)
                setNetworkPath(shelf.network_path || '')
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
            localPath: localPath,
            networkPath: networkPath,
            name: shelfName
        }
        apiClient.saveShelf(shelf)
    }

    const deleteShelf = () => {
        if (shelfDeleteCount > 1) {
            setShelfDeleteCount(shelfDeleteCount - 1)
        }
        else {
            apiClient.deleteShelf(shelfId).then((() => {
                setShelfDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (shelfId) {
        deleteButton = <C.SnowTextButton title={`Delete Shelf (${shelfDeleteCount})`} onPress={deleteShelf} />
    }
    if (shelfDeleted) {
        return <C.Redirect href={routes.admin.shelfList} />
    }
    return (
        <C.View >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onChangeText={setShelfName} value={shelfName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown options={['Movies', 'Shows']} onChoose={chooseShelfKind} selected={shelfKindIndex} />

            <C.SnowLabel>Shelf Local Path</C.SnowLabel>
            <C.SnowInput onChangeText={setLocalPath} value={localPath} />

            <C.SnowLabel>Shelf Network Path</C.SnowLabel>
            <C.SnowInput onChangeText={setNetworkPath} value={networkPath} />

            <C.SnowTextButton title="Save Shelf" onPress={saveShelf} />
            {deleteButton}
        </C.View >
    )
}
