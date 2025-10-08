import { C, useAppContext } from 'snowstream'
export default function InfoPage() {
    const { displayName, config, apiClient } = useAppContext()
    let authedInfo = 'Not logged in.'
    if (displayName) {
        authedInfo = `Logged in as [${displayName}]`
    }
    return (
        <C.View>
            <C.Text>{'\n'}</C.Text>
            <C.SnowText>
                snowstream client v{config.clientVersion}.
            </C.SnowText>
            <C.SnowText>
                {apiClient ? `Talking to server at [${apiClient.webApiUrl}].` : null}
            </C.SnowText>
            <C.SnowText>
                {authedInfo}
            </C.SnowText>
        </C.View>
    )
}