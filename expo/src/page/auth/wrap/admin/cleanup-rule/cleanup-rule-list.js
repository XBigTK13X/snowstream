import { C, useAppContext } from 'snowstream'

export default function DisplayCleanupRuleListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
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
                <C.SnowGrid shuoldFocus itemsPerRow={1} items={rules} renderItem={(rule) => {
                    let title = `${rule.needle} -> ${rule.replacement}`
                    return (
                        <C.SnowTextButton
                            title={title}
                            onPress={navPush(routes.adminCleanupRuleEdit, { ruleId: rule.id }, true)}
                        />
                    )
                }} />
            )
        }
        return (
            <C.View>
                <C.SnowTextButton title="Create New Rule" onPress={navPush(routes.adminCleanupRuleEdit, true)} />
                {rulesList}
            </C.View>
        )
    }
    return (
        <C.View >
            <C.SnowText>Loading jobs</C.SnowText>
        </C.View >
    )
}
