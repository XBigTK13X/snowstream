import { C, useAppContext } from 'snowstream'

const kinds = ['Movies', 'Shows', 'Keepsakes']

export default function AdminFormPage(props) {
    const { currentRoute } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const [form, setForm] = C.React.useState({})
    const [dropdownIndices, setDropdownIndices] = C.React.useState({})
    const [existing, setExisting] = C.React.useState(false)
    const [itemDeleteCount, setItemDeleteCount] = C.React.useState(3)
    const [deleted, setDeleted] = C.React.useState(false)

    C.React.useEffect(() => {
        props.loadExisting(apiClient, currentRoute?.routeParams)
            .then((response) => {
                if (response) {
                    let initialForm = {}
                    let initialDropdownIndices = {}
                    for (let field of props.fields) {
                        if (field.api) {
                            initialForm[field.key] = response[field.api]
                        }
                        else {
                            initialForm[field.key] = response[field.key]
                        }
                        if (field.input === 'dropdown') {
                            initialDropdownIndices[field.key] = field.options.indexOf(initialForm[field.key])
                        }
                    }
                    setForm(initialForm)
                    setDropdownIndices(initialDropdownIndices)
                    setExisting(true)
                } else {
                    let initialForm = {}
                    for (let field of props.fields) {
                        if (field.start) {
                            initialForm[field.key] = field.start
                        } else {
                            initialForm[field.key] = ''
                        }
                    }
                    setForm(initialForm)
                }
            })
    }, [])


    const deleteItem = () => {
        if (itemDeleteCount > 1) {
            setItemDeleteCount(itemDeleteCount - 1)
        }
        else {
            props.deleteItem(apiClient, form).then((() => {
                setDeleted(true)
            }))
        }
    }

    let deleteButton = null
    if (existing) {
        deleteButton = (
            <C.SnowTextButton
                title={`Delete ${props.kind} (${itemDeleteCount})`}
                onPress={deleteItem}
            />
        )
    }

    if (deleted) {
        return <C.Redirect href={props.listRoute(routes)} />
    }

    const changeForm = (key) => {
        return (value) => {
            setForm(prev => {
                return {
                    ...prev,
                    [key]: value
                }
            })
        }
    }

    const changeDropdownIndex = (key) => {
        let options = []
        for (let field of props.fields) {
            if (field.key === key) {
                options = field.options
            }
        }
        return (chosenIndex) => {
            setDropdownIndices(prev => {
                return {
                    ...prev,
                    [key]: chosenIndex
                }
            })
            changeForm(key)(options[chosenIndex])
        }
    }

    const renderItem = (item) => {
        if (!item.hasOwnProperty('input') || item.input === 'text') {
            return (
                <C.SnowView>
                    <C.SnowLabel center>{item.label}</C.SnowLabel>
                    <C.SnowInput
                        onValueChange={changeForm(item.key)}
                        value={form[item.key]}
                    />
                </C.SnowView>
            )
        }
        else if (item.input === 'dropdown') {
            return (
                <C.SnowView>
                    <C.SnowLabel center>{item.label}</C.SnowLabel>
                    <C.SnowDropdown
                        options={item.options}
                        onValueChange={changeDropdownIndex(item.key)}
                        valueIndex={dropdownIndices[item.key] ?? 0}
                    />
                </C.SnowView>
            )
        }
        return <C.SnowText>Unhandled form field [{item}]</C.SnowText>
    }


    return (
        <C.SnowGrid
            itemsPerRow={1}
            focusStart
            focusKey='item-form'
        >
            {
                props.fields.map(
                    item => {
                        return renderItem(item)
                    }
                )
            }

            <C.SnowTextButton
                title={`Save ${props.kind}`}
                onPress={() => {
                    props.saveItem(apiClient, form)
                }}
            />
            {deleteButton}
        </C.SnowGrid >
    )
}
