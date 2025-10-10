import { C, useAppContext } from 'snowstream'

const players = [
    'all',
    'mpv',
    'exo',
    'null'
]

const resolutions = [
    '4K Ultra HD',
    '1080 Full HD'
]

export default function OptionsPage() {
    const { SnowStyle } = C.useSnowContext()
    const { apiClient, clientOptions, changeClientOptions } = useAppContext()

    let storedResolutionIndex = 0
    if (clientOptions) {
        if (clientOptions.resolutionHeight !== 2160) {
            storedResolutionIndex = 1
        }
    }

    const [deviceProfiles, setDeviceProfiles] = C.React.useState(null)

    const [form, setForm] = C.React.useState({
        deviceProfileIndex: null,
        deviceId: clientOptions?.deviceId ?? '',
        resolutionIndex: storedResolutionIndex,
        audioCompression: clientOptions?.audioCompression ?? '',
        hardwareDecoder: clientOptions?.hardwareDecoder ?? '',
        alwaysTranscode: clientOptions?.alwaysTranscode ?? '',
        alwaysUsePlayer: clientOptions?.alwaysUsePlayer ?? '',
        useMpvFast: clientOptions?.useMpvFast ?? '',
    })
    const formRef = C.React.useRef(form)

    C.React.useEffect(() => {
        formRef.current = form
    }, [form])

    C.React.useEffect(() => {
        if (!deviceProfiles) {
            apiClient.getDeviceProfileList().then((response) => {
                const profiles = response.devices
                let storedDeviceProfile = 0
                if (clientOptions) {
                    if (clientOptions.deviceProfile && clientOptions.deviceProfile !== profiles[0]) {
                        storedDeviceProfile = profiles.indexOf(clientOptions.deviceProfile)
                    }
                }
                setDeviceProfiles(profiles)
                setForm((prev) => {
                    return { ...prev, deviceProfileIndex: storedDeviceProfile }
                })
            })
        }
    }, [])

    if (!deviceProfiles) {
        return null
    }

    const chooseResolution = (selection) => {
        setForm(prev => ({ ...prev, resolutionIndex: selection }))
    }

    const chooseDeviceProfile = (selection) => {
        setForm(prev => ({ ...prev, deviceProfileIndex: selection }))
    }

    const chooseAlwaysUsePlayer = (selection) => {
        setForm(prev => ({ ...prev, alwaysUsePlayer: players[selection] }))
    }

    const chooseAudioCompression = (selection) => {
        setForm(prev => ({ ...prev, audioCompression: selection === 0 ? false : true }))
    }

    const chooseHardwareDecoder = (selection) => {
        setForm(prev => ({ ...prev, hardwareDecoder: selection === 0 ? false : true }))
    }

    const chooseAlwaysTranscode = (selection) => {
        setForm(prev => ({ ...prev, alwaysTranscode: selection === 0 ? false : true }))
    }

    const chooseUseMpvFast = (selection) => {
        setForm(prev => ({ ...prev, useMpvFast: selection === 0 ? false : true }))
    }



    const saveForm = () => {
        let payload = { ...formRef.current }
        payload.deviceProfile = deviceProfiles[payload.deviceProfileIndex]
        if (payload.resolutionIndex === 0) {
            payload.resolutionHeight = SnowStyle.surface.uhd.height
            payload.resolutionWidth = SnowStyle.surface.uhd.width
        } else {
            payload.resolutionHeight = SnowStyle.surface.fhd.height
            payload.resolutionWidth = SnowStyle.surface.fhd.width
        }
        changeClientOptions(payload)
    }

    return (
        <C.FillView>
            <C.SnowGrid
                focusStart
                focusKey="page-entry"
                focusDown="device-profile"
                itemsPerRow={3}>
                <C.SnowTextButton title="Save" onPress={saveForm} />
                <C.SnowView>
                    <C.SnowInput value={form.deviceId} onValueChange={(val) => { setForm(prev => ({ ...prev, deviceId: val })) }} />
                    <C.SnowLabel center>Device ID</C.SnowLabel>
                </C.SnowView>
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
            <C.SnowBreak />
            <C.SnowDropdown
                focusKey="device-profile"
                focusDown="video-resolution"
                title="Device Profile"
                options={deviceProfiles}
                onValueChange={chooseDeviceProfile}
                valueIndex={form.deviceProfileIndex} />
            <C.SnowDropdown
                focusKey="video-resolution"
                focusDown="player-choice"
                title="Video Resolution"
                options={resolutions}
                onValueChange={chooseResolution}
                valueIndex={form.resolutionIndex} />
            <C.SnowDropdown
                focusKey="player-choice"
                focusDown="always-transcode"
                title="Always Use Player"
                options={players}
                onValueChange={chooseAlwaysUsePlayer}
                valueIndex={players.indexOf(form.alwaysUsePlayer)} />
            <C.SnowGrid assignFocus={false} itemsPerRow={2}>
                <C.SnowDropdown
                    focusKey="always-transcode"
                    focusRight="audio-compression"
                    focusDown="hardware-decoder"
                    title="Always Transcode"
                    options={['No', 'Yes']}
                    onValueChange={chooseAlwaysTranscode}
                    valueIndex={form.alwaysTranscode === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="audio-compression"
                    focusDown="fast-mpv"
                    title="Audio Compression (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseAudioCompression}
                    valueIndex={form.audioCompression === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="hardware-decoder"
                    focusRight="fast-mpv"
                    title="Hardware Decoder (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseHardwareDecoder}
                    valueIndex={form.hardwareDecoder === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="fast-mpv"
                    title="Fast Config (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseUseMpvFast}
                    valueIndex={form.useMpvFast === true ? 1 : 0} />
            </C.SnowGrid>
        </C.FillView>

    )
}
