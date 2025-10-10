import { C, useAppContext } from 'snowstream'

const kinds = ['Movies', 'Shows', 'Keepsakes']

export default function ShelfEditPage() {
    const { apiClient, routes, currentRoute } = useAppContext()

    const [shelfName, setShelfName] = C.React.useState('')
    const [localPath, setLocalPath] = C.React.useState('')
    const [networkPath, setNetworkPath] = C.React.useState('')
    const [shelfKind, setShelfKind] = C.React.useState('Movies')
    const [shelfKindIndex, setShelfKindIndex] = C.React.useState(0)
    const [shelfId, setShelfId] = C.React.useState(null)
    const [shelfDeleteCount, setShelfDeleteCount] = C.React.useState(3)
    const [shelfDeleted, setShelfDeleted] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!shelfId && currentRoute.routeParams.shelfId) {
            apiClient.getShelf(currentRoute.routeParams.shelfId).then((shelf) => {
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
        setShelfKindIndex(chosenKindIndex)
        setShelfKind(kinds[chosenKindIndex])
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
        return <C.Redirect href={routes.adminShelfList} />
    }
    return (
        <C.SnowGrid itemsPerRow={1} focusStart focusKey='page-entry'>
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={setShelfName} value={shelfName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={kinds}
                onValueChange={chooseShelfKind}
                valueIndex={shelfKindIndex}
            />

            <C.SnowLabel>Shelf Local Path</C.SnowLabel>
            <C.SnowInput onValueChange={setLocalPath} value={localPath} />

            <C.SnowLabel>Shelf Network Path</C.SnowLabel>
            <C.SnowInput onValueChange={setNetworkPath} value={networkPath} />

            <C.SnowTextButton title="Save Shelf" onPress={saveShelf} />
            {deleteButton}
        </C.SnowGrid >
    )
}
