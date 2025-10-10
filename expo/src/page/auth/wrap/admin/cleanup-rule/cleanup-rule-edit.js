import { C, useAppContext } from 'snowstream'

const targetKinds = [
    'All',
    'TubeArchivist',
    'Frigate NVR',
    'HDHomeRun',
    'IPTV M3U'
]


export default function DisplayCleanupRuleEditPage() {
    const { apiClient, routes, currentRoute } = useAppContext()

    const [ruleLoaded, setRuleLoaded] = C.React.useState(false)
    const [ruleDeleteCount, setRuleDeleteCount] = C.React.useState(3)
    const [ruleDeleted, setRuleDeleted] = C.React.useState(false)

    const [ruleForm, setRuleForm] = C.React.useState({
        needle: '',
        replacement: '',
        ruleKind: '',
        targetKind: targetKinds[0],
        priority: '',
        id: null
    })

    C.React.useEffect(() => {
        if (!ruleLoaded && currentRoute.routeParams.ruleId) {
            apiClient.getDisplayCleanupRule(currentRoute.routeParams.ruleId)
                .then((rule) => {
                    setRuleForm({
                        id: rule.id,
                        targetKind: rule.target_kind,
                        ruleKind: rule.rule_kind,
                        priority: rule.priority ?? '',
                        needle: rule.needle,
                        replacement: rule.replacement
                    })
                    setRuleLoaded(true)
                })
        }
    })

    const saveRule = () => {
        apiClient.saveDisplayCleanupRule(ruleForm)
    }

    const deleteRule = () => {
        if (ruleDeleteCount > 1) {
            setRuleDeleteCount(ruleDeleteCount - 1)
        }
        else {
            apiClient.deleteDisplayCleanupRule(ruleForm.id).then((() => {
                setRuleDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (ruleForm.id) {
        deleteButton = <C.SnowTextButton title={`Delete Shelf (${ruleDeleteCount})`} onPress={deleteRule} />
    }
    if (ruleDeleted) {
        return <C.Redirect href={routes.adminCleanupRuleList} />
    }
    return (
        <C.FillView >
            <C.SnowLabel>Needle</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, needle: val }
                })
            }} value={ruleForm.needle} />

            <C.SnowLabel>Replacement</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, replacement: val }
                })
            }} value={ruleForm.replacement} />
            <C.SnowLabel>Rule Kind</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, ruleKind: val }
                })
            }} value={ruleForm.ruleKind} />

            <C.SnowLabel>Target Kind</C.SnowLabel>
            <C.SnowDropdown
                options={targetKinds}
                onValueChange={(index) => {
                    setRuleForm((prev) => {
                        return { ...prev, targetKind: targetKinds[index] }
                    })
                }}
                valueIndex={targetKinds.indexOf(ruleForm.targetKind)}
            />

            <C.SnowLabel>Priority</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, priority: val }
                })
            }} value={ruleForm.priority} />

            <C.SnowTextButton title="Save Rule" onPress={saveRule} />
            {deleteButton}
        </C.FillView >
    )
}
