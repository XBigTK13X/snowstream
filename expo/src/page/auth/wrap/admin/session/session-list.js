import { C, useAppContext } from 'snowstream'

export default function SessionListPage() {
    const { apiClient } = useAppContext()
    const [sessions, setSessions] = C.React.useState(null)
    C.React.useEffect(() => {
        if (!sessions) {
            apiClient.getSessionList().then((response) => {
                setSessions(response)
            })
        }
    })

    if (sessions) {
        let transcodes = <C.SnowText>No active transcodes</C.SnowText>
        if (sessions.transcodes && sessions.transcodes.length) {
            transcodes = (
                <>
                    <C.SnowLabel>Activate Transcodes</C.SnowLabel>
                    <C.SnowGrid itemsPerRow={1}>
                        {sessions.transcodes.map((session, sessionIndex) => {
                            return (
                                <C.SnowText key={sessionIndex}>{C.Snow.stringifySafe(session)}</C.SnowText>
                            )
                        })}
                    </C.SnowGrid>
                </>
            )
        }
        let updaters = <C.SnowText>No active updaters.</C.SnowText>
        if (sessions.updaters && sessions.updaters.length) {
            updaters = (
                <>
                    <C.SnowLabel>Activate Updaters</C.SnowLabel>
                    <C.SnowGrid>
                        {sessions.updaters.map((session, sessionIndex) => {
                            return (
                                <C.SnowText key={sessionIndex}>{C.Snow.stringifySafe(session)}</C.SnowText>
                            )
                        })}
                    </C.SnowGrid>
                </>
            )
        }
        return (
            <>
                {transcodes}
                {updaters}
            </>
        )
    }

    return null
}
