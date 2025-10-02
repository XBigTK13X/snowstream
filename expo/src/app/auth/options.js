import C from '../../common'

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
    const { SnowStyle } = C.useStyleContext()
    const { apiClient, clientOptions, changeClientOptions } = C.useAppContext()

    C.useFocusLayer('options')

    let storedResolution = 0
    if (clientOptions) {
        if (clientOptions.resolutionHeight !== 2160) {
            storedResolution = 1
        }
    }
    const [resolutionIndex, setResolutionIndex] = C.React.useState(storedResolution)
    const [resolutionWidth, setResolutionWidth] = C.React.useState(clientOptions ? clientOptions.resolutionWidth : '')
    const [resolutionHeight, setResolutionHeight] = C.React.useState(clientOptions ? clientOptions.resolutionHeight : '')

    const [deviceProfiles, setDeviceProfiles] = C.React.useState(null)
    const [deviceProfileIndex, setDeviceProfileIndex] = C.React.useState(null)
    const [deviceProfile, setDeviceProfile] = C.React.useState('')
    const [deviceId, setDeviceId] = C.React.useState(clientOptions ? clientOptions.deviceId : '')


    const [audioCompression, setAudioCompression] = C.React.useState(clientOptions ? clientOptions.audioCompression : '')
    const [hardwareDecoder, setHardwareDecoder] = C.React.useState(clientOptions ? clientOptions.hardwareDecoder : '')
    const [alwaysTranscode, setAlwaysTranscode] = C.React.useState(clientOptions ? clientOptions.alwaysTranscode : '')
    const [alwaysUsePlayer, setAlwaysUsePlayer] = C.React.useState(clientOptions ? clientOptions.alwaysUsePlayer : '')
    const [useMpvFast, setUseMpvFast] = C.React.useState(clientOptions ? clientOptions.useMpvFast : '')

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
                setDeviceProfileIndex(storedDeviceProfile)
                setDeviceProfile(clientOptions ? clientOptions.deviceProfile : '')
            })
        }
    })

    const chooseResolution = (selection) => {
        if (selection === 0) {
            setResolutionHeight(SnowStyle.surface.uhd.height)
            setResolutionWidth(SnowStyle.surface.uhd.width)
        } else {
            setResolutionHeight(SnowStyle.surface.fhd.height)
            setResolutionWidth(SnowStyle.surface.fhd.width)
        }
        setResolutionIndex(selection)
    }

    const chooseDeviceProfile = (selection) => {
        setDeviceProfile(deviceProfiles[selection])
        setDeviceProfileIndex(selection)
    }

    const chooseAudioCompression = (selection) => {
        setAudioCompression(selection === 0 ? false : true)
    }

    const chooseHardwareDecoder = (selection) => {
        setHardwareDecoder(selection === 0 ? false : true)
    }

    const chooseAlwaysTranscode = (selection) => {
        setAlwaysTranscode(selection === 0 ? false : true)
    }

    const chooseAlwaysUsePlayer = (selection) => {
        setAlwaysUsePlayer(players[selection])
    }

    const chooseUseMpvFast = (selection) => {
        setUseMpvFast(selection === 0 ? false : true)
    }

    if (!deviceProfiles) {
        return null
    }

    const saveForm = () => {
        const payload = {
            alwaysTranscode,
            alwaysUsePlayer,
            audioCompression,
            deviceId,
            deviceProfile,
            hardwareDecoder,
            resolutionHeight,
            resolutionWidth,
            useMpvFast,
        }
        changeClientOptions(payload)
    }

    return (
        <C.View>
            <C.SnowGrid
                focusStart
                focusKey="page-entry"
                focusDown="device-profile"
                itemsPerRow={3}>
                <C.SnowTextButton title="Save" onPress={saveForm} />
                <C.SnowView>
                    <C.SnowInput value={deviceId} onValueChange={setDeviceId} />
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
                valueIndex={deviceProfileIndex} />
            <C.SnowDropdown
                focusKey="video-resolution"
                focusDown="player-choice"
                title="Video Resolution"
                options={resolutions}
                onValueChange={chooseResolution}
                valueIndex={resolutionIndex} />
            <C.SnowDropdown
                focusKey="player-choice"
                focusDown="always-transcode"
                title="Always Use Player"
                options={players}
                onValueChange={chooseAlwaysUsePlayer}
                valueIndex={players.indexOf(alwaysUsePlayer)} />
            <C.SnowGrid assignFocus={false} itemsPerRow={2}>
                <C.SnowDropdown
                    focusKey="always-transcode"
                    focusRight="audio-compression"
                    focusDown="hardware-decoder"
                    title="Always Transcode"
                    options={['No', 'Yes']}
                    onValueChange={chooseAlwaysTranscode}
                    valueIndex={alwaysTranscode === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="audio-compression"
                    focusDown="fast-mpv"
                    title="Audio Compression (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseAudioCompression}
                    valueIndex={audioCompression === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="hardware-decoder"
                    focusRight="fast-mpv"
                    title="Hardware Decoder (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseHardwareDecoder}
                    valueIndex={hardwareDecoder === true ? 1 : 0} />
                <C.SnowDropdown
                    focusKey="fast-mpv"
                    title="Fast Config (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseUseMpvFast}
                    valueIndex={useMpvFast === true ? 1 : 0} />
            </C.SnowGrid>
        </C.View>

    )
}
