import C from '../../../../common'

export default function DisplayCleanupRuleListPage() {
    const { apiClient } = C.useAppContext()
    const { routes, config } = C.useAppContext()
    const [rules, setRules] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!jobs) {
            apiClient.getDisplayCleanupRuleList().then((response) => {
                setRules(response)
            })
        }
    })

    if (!!jobs) {
        return (
            <C.FillView>
                <C.SnowGrid itemsPerRow={1} items={rules} renderItem={(rule) => {
                    let title = `${rule.needle} -> ${rule.replacement}`
                    return (
                        <C.SnowTextButton
                            title={title}
                            onPress={routes.func(routes.admin.cleanupRuleEdit, { ruleId: rule.id })}
                        />
                    )
                }} />
            </C.FillView>
        )
    }
    return (
        <C.View >
            <C.SnowText>Loading jobs</C.SnowText>
        </C.View >
    )
}
