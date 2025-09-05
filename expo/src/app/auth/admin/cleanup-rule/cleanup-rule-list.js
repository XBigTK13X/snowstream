import C from '../../../../common'

export default function DisplayCleanupRuleListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [rules, setRules] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!rules) {
            apiClient.getDisplayCleanupRuleList().then((response) => {
                setRules(response)
            })
        }
    })

    if (!!rules) {
        let rulesList = <C.SnowText>No display cleanup rules found</C.SnowText>
        if (rules.length) {
            rulesList = (
                <C.SnowGrid itemsPerRow={1} items={rules} renderItem={(rule) => {
                    let title = `${rule.needle} -> ${rule.replacement}`
                    return (
                        <C.SnowTextButton
                            title={title}
                            onPress={routes.func(routes.admin.cleanupRuleEdit, { ruleId: rule.id })}
                        />
                    )
                }} />
            )
        }
        return (
            <C.FillView>
                <C.SnowTextButton title="Create New Rule" onPress={routes.func(routes.admin.cleanupRuleEdit)} />
                {rulesList}
            </C.FillView>
        )
    }
    return (
        <C.View >
            <C.SnowText>Loading jobs</C.SnowText>
        </C.View >
    )
}
