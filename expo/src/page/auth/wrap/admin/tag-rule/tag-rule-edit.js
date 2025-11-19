import { C, useAppContext } from 'snowstream'

const targetKinds = [
    'All',
    'TubeArchivist',
    'Frigate NVR',
    'HDHomeRun',
    'IPTV M3U',
    'Shelf'
]

export default function TagRuleEditPage() {
    const { currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [ruleLoaded, setRuleLoaded] = C.React.useState(false)
    const [ruleDeleteCount, setRuleDeleteCount] = C.React.useState(3)
    const [ruleDeleted, setRuleDeleted] = C.React.useState(false)

    const [ruleForm, setRuleForm] = C.React.useState({
        tagName: '',
        triggerKind: '',
        triggerTarget: '',
        ruleKind: '',
        targetKind: targetKinds[0],
        priority: '',
        id: null,
        tagName: ''
    })

    C.React.useEffect(() => {
        if (!ruleLoaded && currentRoute.routeParams.ruleId) {
            apiClient.getTagRule(currentRoute.routeParams.ruleId)
                .then((rule) => {
                    setRuleForm({
                        id: rule.id,
                        tagName: rule.tag.name,
                        targetKind: rule.target_kind,
                        ruleKind: rule.rule_kind,
                        priority: rule.priority ?? '',
                        triggerTarget: rule.trigger_target,
                        triggerKind: rule.trigger_kind
                    })
                    setRuleLoaded(true)
                })
        }
    })

    const saveRule = () => {
        apiClient.saveTagRule(ruleForm)
    }

    const deleteRule = () => {
        if (ruleDeleteCount > 1) {
            setRuleDeleteCount(ruleDeleteCount - 1)
        }
        else {
            apiClient.deleteTagRule(ruleForm.id).then((() => {
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
            <C.SnowLabel>Tag Name</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, tagName: val }
                })
            }} value={ruleForm.tagName} />

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
            <C.SnowLabel>Trigger Kind</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, triggerKind: val }
                })
            }} value={ruleForm.triggerKind} />

            <C.SnowLabel>Trigger Target</C.SnowLabel>
            <C.SnowInput onValueChange={(val) => {
                setRuleForm((prev) => {
                    return { ...prev, triggerTarget: val }
                })
            }} value={ruleForm.triggerTarget} />

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
