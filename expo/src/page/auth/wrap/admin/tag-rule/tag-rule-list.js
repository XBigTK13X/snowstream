import { C, useAppContext } from 'snowstream'

export default function TagRuleListPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [rules, setRules] = C.React.useState(null)

    C.React.useEffect(() => {
        if (!rules) {
            apiClient.getTagRuleList().then((response) => {
                setRules(response)
            })
        }
    })

    if (!!rules) {
        let rulesList = <C.SnowText>No tag rules found</C.SnowText>
        if (rules.length) {
            rulesList = (
                <C.SnowGrid shouldFocus itemsPerRow={1} items={rules} renderItem={(rule) => {
                    let title = `${rule.target_kind} -> ${rule.trigger_kind} == ${rule.trigger_target} -> ${rule.tag.name}`
                    return (
                        <C.SnowTextButton
                            title={title}
                            onPress={navPush({
                                path: routes.adminTagRuleEdit,
                                params: { ruleId: rule.id }
                            })}
                        />
                    )
                }} />
            )
        }
        return (
            <>
                <C.SnowTextButton title="Create New Rule" onPress={navPush({ path: routes.adminTagRuleEdit })} />
                {rulesList}
            </>
        )
    }
    return (
        <C.View >
            <C.SnowText>Loading jobs</C.SnowText>
        </C.View >
    )
}
