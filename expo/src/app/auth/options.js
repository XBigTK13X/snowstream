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
    const { apiClient, clientOptions, changeClientOptions } = C.useAppContext()

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
            setResolutionHeight(C.Style.surface.uhd.height)
            setResolutionWidth(C.Style.surface.uhd.width)
        } else {
            setResolutionHeight(C.Style.surface.fhd.height)
            setResolutionWidth(C.Style.surface.fhd.width)
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

    if (!deviceProfiles) {
        return null
    }

    return (
        <C.FillView>
            <C.SnowGrid shrink itemsPerRow={3}>
                <C.SnowTextButton title="Save" onPress={() => {
                    changeClientOptions({
                        deviceId,
                        resolutionWidth,
                        resolutionHeight,
                        audioCompression,
                        hardwareDecoder,
                        alwaysTranscode,
                        alwaysUsePlayer,
                        deviceProfile
                    })
                }} />
                <C.View>
                    <C.SnowLabel center>Device ID</C.SnowLabel>
                    <C.SnowInput value={deviceId} onValueChange={setDeviceId} />
                </C.View>
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
            <C.SnowDropdown
                title="Device Profile"
                options={deviceProfiles}
                onValueChange={chooseDeviceProfile}
                valueIndex={deviceProfileIndex} />
            <C.SnowDropdown
                title="Video Resolution"
                options={resolutions}
                onValueChange={chooseResolution}
                valueIndex={resolutionIndex} />
            <C.SnowDropdown
                title="Always Use Player"
                options={players}
                onValueChange={chooseAlwaysUsePlayer}
                valueIndex={players.indexOf(alwaysUsePlayer)} />
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowDropdown
                    title="Always Transcode"
                    options={['No', 'Yes']}
                    onValueChange={chooseAlwaysTranscode}
                    valueIndex={alwaysTranscode === true ? 1 : 0} />
                <C.SnowDropdown
                    title="Audio Compression (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseAudioCompression}
                    valueIndex={audioCompression === true ? 1 : 0} />
                <C.SnowDropdown
                    title="Hardware Decoder (mpv)"
                    options={['No', 'Yes']}
                    onValueChange={chooseHardwareDecoder}
                    valueIndex={hardwareDecoder === true ? 1 : 0} />
            </C.SnowGrid>
        </C.FillView>

    )
}
