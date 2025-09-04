import C from '../../../../common'

export default function DisplayCleanupRuleEditPage() {
    const { apiClient } = C.useAppContext()
    const { routes } = C.useAppContext()

    const [ruleId, setRuleId] = C.React.useState(null)
    const [ruleDeleteCount, setRuleDeleteCount] = C.React.useState(3)
    const [ruleDeleted, setRuleDeleted] = C.React.useState(false)
    const localParams = C.useLocalSearchParams()

    C.React.useEffect(() => {
        if (!ruleId && localParams.ruleId) {
            apiClient.getShelf(localParams.ruleId).then((shelf) => {
                setRuleId(shelf.id)
                setShelfKind(shelf.kind)
                setShelfKindIndex(shelf.kind == 'Movies' ? 0 : 1)
                setLocalPath(shelf.local_path)
                setShelfName(shelf.name)
                setNetworkPath(shelf.network_path || '')
            })
        }
    })

    const saveRule = () => {
        let shelf = {
            id: ruleId,
            kind: shelfKind,
            localPath: localPath,
            networkPath: networkPath,
            name: shelfName
        }
        apiClient.saveRule(shelf)
    }

    const deleteRule = () => {
        if (ruleDeleteCount > 1) {
            setRuleDeleteCount(ruleDeleteCount - 1)
        }
        else {
            apiClient.deleteDisplayCleanupRule(ruleId).then((() => {
                setRuleDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (ruleId) {
        deleteButton = <C.SnowTextButton title={`Delete Shelf (${ruleDeleteCount})`} onPress={deleteRule} />
    }
    if (ruleDeleted) {
        return <C.Redirect href={routes.admin.cleanupRuleList} />
    }
    return (
        <C.FillView >
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={setShelfName} value={shelfName} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={['Movies', 'Shows', 'Keepsakes']}
                onValueChange={chooseShelfKind}
                valueIndex={shelfKindIndex}
            />

            <C.SnowLabel>Shelf Local Path</C.SnowLabel>
            <C.SnowInput onValueChange={setLocalPath} value={localPath} />

            <C.SnowLabel>Shelf Network Path</C.SnowLabel>
            <C.SnowInput onValueChange={setNetworkPath} value={networkPath} />

            <C.SnowTextButton title="Save Shelf" onPress={saveRule} />
            {deleteButton}
        </C.FillView >
    )
}
