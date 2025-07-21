import C from '../../common'

export default function OptionsPage() {
    const { clientOptions, changeClientOptions } = C.useAppContext()
    const [resolutionWidth, setResolutionWidth] = C.React.useState(clientOptions ? clientOptions.resolutionWidth : '')
    const [resolutionHeight, setResolutionHeight] = C.React.useState(clientOptions ? clientOptions.resolutionHeight : '')
    const [audioCompression, setAudioCompression] = C.React.useState(clientOptions ? clientOptions.audioCompression : '')
    const [deviceId, setDeviceId] = C.React.useState(clientOptions ? clientOptions.deviceId : '')
    console.log({ clientOptions })
    return (
        <C.FillView>
            <C.SnowGrid itemsPerRow={3} shrink>
                <C.SnowTextButton
                    title="Download Latest"
                    onPress={() => {
                        if (C.isTV) {
                            C.Linking.openURL('https://android.9914.us/snowstream-tv.apk')
                        } else {
                            C.Linking.openURL('https://android.9914.us/snowstream-mobile.apk')
                        }
                    }}
                />
            </C.SnowGrid>
            <C.SnowLabel>Resolution Width</C.SnowLabel>
            <C.SnowInput value={resolutionWidth} onValueChange={setResolutionWidth} />
            <C.SnowLabel>Resolution Height</C.SnowLabel>
            <C.SnowInput value={resolutionHeight} onValueChange={setResolutionHeight} />
            <C.SnowLabel>Device ID</C.SnowLabel>
            <C.SnowInput value={deviceId} onValueChange={(evt) => { console.log("what"); setDeviceId(evt); }} />
            <C.SnowToggle
                title="Enable Audio Compression"
                value={audioCompression}
                onValueChange={setAudioCompression} />
            <C.SnowTextButton title="Save" onPress={() => {
                changeClientOptions({
                    resolutionWidth,
                    resolutionHeight,
                    audioCompression,
                    deviceId,
                })
            }} />
        </C.FillView>

    )
}
