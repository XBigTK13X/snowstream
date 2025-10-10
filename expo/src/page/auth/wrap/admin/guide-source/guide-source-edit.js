import Snow from 'expo-snowui'
import { C, useAppContext } from 'snowstream'

function ChannelEditRow() {
    return null
}

const guideSourceKinds = [
    'IptvEpg',
    'SchedulesDirect'
]

export default function EpisodeGuideEditPage() {
    const { apiClient, routes } = useAppContext()
    const { navPush, currentRoute } = Snow.useSnowContext()
    const [guideSource, setGuideSource] = C.React.useState(null)
    const [kindIndex, setKindIndex] = C.React.useState(0)
    const [form, setForm] = C.React.useState({
        id: null,
        name: '',
        kind: guideSourceKinds[0],
        url: '',
        username: '',
        password: ''
    })
    const [deleteCount, setDeleteCount] = C.React.useState(3)
    const [deleted, setDeleted] = C.React.useState(false)

    C.React.useEffect(() => {
        if (!guideSource && currentRoute.routeParams.guideSourceId) {
            apiClient.getChannelGuideSource(currentRoute.routeParams.guideSourceId).then((guideSource) => {
                setGuideSource(guideSource)
                setForm({
                    id: guideSource.id,
                    name: guideSource.name,
                    kind: guideSource.kind,
                    url: guideSource.url,
                    username: guideSource.username,
                    password: guideSource.password
                })
                setKindIndex(guideSourceKinds.indexOf(guideSource.kind))
            })
        }
    })

    const changeForm = (key) => {
        return (val) => {
            if (key === 'kind') {
                setKindIndex(val)
                val = guideSourceKinds[val]
            }
            setForm((prev) => {
                let result = { ...prev }
                result[key] = val
                return result
            })
        }
    }

    const saveGuideSource = () => {
        apiClient.saveChannelGuideSource(form)
    }

    const deleteGuideSource = () => {
        if (deleteCount > 1) {
            setDeleteCount(deleteCount - 1)
        }
        else {
            apiClient.deleteChannelGuideSource(guideSource.id).then((() => {
                setDeleted(true)
            }))
        }
    }

    let existingButtons = null
    if (currentRoute.routeParams.guideSourceId) {
        existingButtons = (
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowTextButton title="Channels" onPress={navPush(routes.adminChannelsEdit, { guideSourceId: currentRoute.routeParams.guideSourceId }, true)} />
                <C.SnowTextButton title={`Delete (${deleteCount})`} onPress={deleteGuideSource} />
            </C.SnowGrid>
        )
    }
    if (deleted) {
        return <C.Redirect href={routes.adminChannelGuideSourceList} />
    }

    if (!form) {
        return null
    }

    return (
        <C.View>
            {existingButtons}
            <C.SnowLabel>Name</C.SnowLabel>
            <C.SnowInput onValueChange={changeForm('name')} value={form.name} />

            <C.SnowLabel>Kind</C.SnowLabel>
            <C.SnowDropdown
                options={guideSourceKinds}
                onValueChange={changeForm('kind')}
                valueIndex={kindIndex} />
            <C.SnowLabel>URL</C.SnowLabel>
            <C.SnowInput onValueChange={changeForm('url')} value={form.url} />

            <C.SnowLabel>Username</C.SnowLabel>
            <C.SnowInput onValueChange={changeForm('username')} value={form.username} />

            <C.SnowLabel>Password</C.SnowLabel>
            <C.SnowInput onValueChange={changeForm('password')} value={form.password} />

            <C.SnowTextButton title="Save Guide Source" onPress={saveGuideSource} />
        </C.View >
    )
}
