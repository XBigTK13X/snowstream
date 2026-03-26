import { C, useAppContext } from 'snowstream'

export default function AdminListPage(props) {
    const { apiClient, routes } = useAppContext()
    const { navPush } = C.useSnowContext()
    const [items, setItems] = C.React.useState(null)

    C.React.useEffect(() => {
        props.loadItems(apiClient).then((response) => {
            setItems(response)
        })
    }, [])

    if (!items?.length) {
        return <C.SnowText>Loading {props.kind}s...</C.SnowText>
    }

    const renderItem = (item, itemIndex) => {
        return (
            <C.SnowTextButton
                title={item.name}
                onPress={navPush({
                    path: props.editPath(routes),
                    params: props.editParams(item)
                })}
            />
        )
    }

    let createTitle = `Create new ${props.kind}`

    return (
        <>
            <C.SnowGrid>
                <C.SnowTextButton
                    focusStart
                    focusKey='page-entry'
                    title={createTitle}
                    onPress={navPush({
                        path: props.editPath(routes)
                    })}
                />
            </C.SnowGrid>
            <C.SnowLabel center>{items.length} {props.kind}s found</C.SnowLabel>
            <C.SnowGrid
                focusKey="item-list"
                items={items}
                renderItem={renderItem}
            />
        </>
    )

    return null
}
