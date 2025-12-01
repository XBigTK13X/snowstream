import { C, useAppContext } from 'snowstream'

const players = [
    'all',
    'mpv',
    'exo',
    'null'
]

const resolutions = [
    'Video File',
    '2160p',
    '1080p'
]

export default function OptionsPage() {
    const { apiClient, clientOptions, changeClientOptions } = useAppContext()

    const [deviceProfiles, setDeviceProfiles] = C.React.useState(null)

    const [form, setForm] = C.React.useState({
        deviceProfile: clientOptions?.deviceProfile,
        deviceId: clientOptions?.deviceId ?? '',
        resolutionKind: clientOptions?.resolutionKind,
        alwaysTranscode: clientOptions?.alwaysTranscode ?? '',
        alwaysUsePlayer: clientOptions?.alwaysUsePlayer ?? '',
        audioCompression: clientOptions?.audioCompression ?? '',
        hardwareDecoder: clientOptions?.hardwareDecoder ?? '',
    })
    const formRef = C.React.useRef(form)

    C.React.useEffect(() => {
        formRef.current = form
    }, [form])

    C.React.useEffect(() => {
        if (!deviceProfiles) {
            apiClient.getDeviceProfileList().then((response) => {
                const profiles = response.devices
                setDeviceProfiles(profiles)
                let currentProfile = null
                if (profiles.includes(clientOptions?.deviceProfile)) {
                    currentProfile = clientOptions?.deviceProfile
                } else {
                    currentProfile = profiles[0]
                }
                setForm((prev) => {
                    return { ...prev, deviceProfile: currentProfile }
                })
            })
        }
    }, [])

    if (!deviceProfiles) {
        return null
    }

    const chooseResolution = (selection) => {
        setForm(prev => ({ ...prev, resolutionKind: resolutions[selection] }))
    }

    const chooseDeviceProfile = (selection) => {
        setForm(prev => ({ ...prev, deviceProfile: deviceProfiles[selection] }))
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

    const saveForm = () => {
        changeClientOptions(formRef.current)
    }

    return (
        <C.FillView>
            <C.SnowLabel center>Device ID</C.SnowLabel>
            <C.SnowGrid
                focusStart
                focusKey="page-entry"
                focusDown="device-profile"
                itemsPerRow={3}>
                <C.SnowTextButton title="Save" onPress={saveForm} />
                <C.SnowInput value={form.deviceId} onValueChange={(val) => { setForm(prev => ({ ...prev, deviceId: val })) }} />
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
                focusDown="player-choice"
                title="Device Profile"
                options={deviceProfiles}
                onValueChange={chooseDeviceProfile}
                valueIndex={deviceProfiles.indexOf(form.deviceProfile)} />

            <C.SnowDropdown
                focusKey="player-choice"
                focusDown="player-settings"
                title="Force Player"
                options={players}
                onValueChange={chooseAlwaysUsePlayer}
                valueIndex={players.indexOf(form.alwaysUsePlayer)} />

            <C.SnowLabel center>Player Settings</C.SnowLabel>

            <C.SnowTabs
                focusKey="player-settings"
                headers={[
                    'Audio',
                    'Resolution',
                    'Transcode',
                    'Hardware',
                ]}>
                <C.SnowDropdown
                    title="Audio Compression (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseAudioCompression}
                    valueIndex={form.audioCompression === true ? 1 : 0} />
                <C.SnowDropdown
                    title="Video Resolution (mpv)"
                    options={resolutions}
                    onValueChange={chooseResolution}
                    valueIndex={resolutions.indexOf(form.resolutionKind)} />
                <C.SnowDropdown
                    title="Always Transcode"
                    options={['No', 'Yes']}
                    onValueChange={chooseAlwaysTranscode}
                    valueIndex={form.alwaysTranscode === true ? 1 : 0} />
                <C.SnowDropdown
                    title="Hardware Decoder (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseHardwareDecoder}
                    valueIndex={form.hardwareDecoder === true ? 1 : 0} />


            </C.SnowTabs>
        </C.FillView>

    )
}
