import { C, useAppContext } from 'snowstream'

export default function AdminFormPage(props) {
    const { currentRoute, navPush } = C.useSnowContext()
    const { apiClient, routes } = useAppContext()

    const formPlaceholder = {}
    for (let field of props.fields) {
        formPlaceholder[field.key] = ''
    }

    const [form, setForm] = C.React.useState(formPlaceholder)
    const [dropdownIndices, setDropdownIndices] = C.React.useState({})
    const [existing, setExisting] = C.React.useState(false)
    const [itemDeleteCount, setItemDeleteCount] = C.React.useState(3)
    const [deleted, setDeleted] = C.React.useState(false)
    const [saveError, setSaveError] = C.React.useState(null)
    const [saveMessage, setSaveMessage] = C.React.useState(`Save ${props.kind}`)

    C.React.useEffect(() => {
        props.loadExisting(apiClient, currentRoute?.routeParams)
            .then((response) => {
                if (response) {
                    let initialForm = {}
                    let initialDropdownIndices = {}
                    for (let field of props.fields) {
                        if (field.api) {
                            initialForm[field.key] = response[field.api] ?? ''
                        }
                        else {
                            initialForm[field.key] = response[field.key] ?? ''
                        }
                        if (field.input === 'dropdown') {
                            initialDropdownIndices[field.key] = field.options.indexOf(initialForm[field.key])
                        }
                        if (initialForm[field.key] === undefined && field.missing) {
                            initialForm[field.key] = field.missing(response)
                        }
                    }
                    initialForm.id = response.id
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

    const saveItem = () => {
        let apiForm = {}
        for (let field of props.fields) {
            if (field.api) {
                apiForm[field.api] = form[field.key]
            }
            else {
                apiForm[field.key] = form[field.key]
            }
        }
        if (form.id) {
            apiForm.id = form.id
        }
        setSaveError(null)
        props.saveItem(apiClient, apiForm)
            .then(() => {
                setSaveMessage('Save Complete')
            })
            .catch(err => {
                if (err) {
                    setSaveError(C.Snow.stringifySafe(err))
                }
            })
    }


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
                <C.SnowGrid itemsPerRow={1}>
                    <C.SnowLabel center>{item.label}</C.SnowLabel>
                    {item.note ? <C.SnowText center>{item.note}</C.SnowText> : null}
                    <C.SnowInput
                        onValueChange={changeForm(item.key)}
                        value={form[item.key]}
                    />
                </C.SnowGrid>
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

    let editButtons = null
    if (props.editButtons) {
        editButtons = (
            <C.SnowView>
                <C.SnowGrid>
                    {props.editButtons(routes, currentRoute, navPush)}
                </C.SnowGrid>
                <C.SnowBreak />
            </C.SnowView>
        )
    }

    return (
        <C.SnowView>
            {editButtons}
            <C.SnowGrid
                itemsPerRow={1}
                focusStart
                focusKey='item-form' >
                {props.fields.map(item => {
                    return renderItem(item)
                })}
            </C.SnowGrid >
            <C.SnowBreak />
            <C.SnowGrid itemsPerRow={1}>
                <C.SnowTextButton
                    title={saveMessage}
                    onPress={saveItem} />
                {deleteButton}
            </C.SnowGrid>
            {saveError !== null ? <C.SnowText>{saveError}</C.SnowText> : null}
        </C.SnowView>
    )
}
