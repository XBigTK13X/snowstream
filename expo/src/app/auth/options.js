import C from '../../common'

export default function OptionsPage() {
    const { clientOptions, changeClientOptions } = C.useAppContext()
    const resolutions = ['4K Ultra HD', '1080 Full HD']
    let storedResolution = 0
    if (clientOptions) {
        if (clientOptions.resolutionHeight !== 2160) {
            storedResolution = 1
        }
    }
    const [resolutionIndex, setResolutionIndex] = C.React.useState(storedResolution)
    const [resolutionWidth, setResolutionWidth] = C.React.useState(clientOptions ? clientOptions.resolutionWidth : '')
    const [resolutionHeight, setResolutionHeight] = C.React.useState(clientOptions ? clientOptions.resolutionHeight : '')
    const [audioCompression, setAudioCompression] = C.React.useState(clientOptions ? clientOptions.audioCompression : '')
    const [hardwareDecoder, setHardwareDecoder] = C.React.useState(clientOptions ? clientOptions.hardwareDecoder : '')
    const [deviceId, setDeviceId] = C.React.useState(clientOptions ? clientOptions.deviceId : '')

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

    const chooseAudioCompression = (selection) => {
        setAudioCompression(selection === 0 ? false : true)
    }

    const chooseHardwareDecoder = (selection) => {
        setHardwareDecoder(selection === 0 ? false : true)
    }

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
            <C.FillView>
                <C.SnowLabel center>Device ID</C.SnowLabel>
                <C.SnowGrid shrink itemsPerRow={3}>
                    <C.SnowInput value={deviceId} onValueChange={setDeviceId} />
                </C.SnowGrid>
                <C.SnowLabel center>Video Resolution</C.SnowLabel>
                <C.SnowDropdown
                    options={resolutions}
                    onValueChange={chooseResolution}
                    valueIndex={resolutionIndex} />
                <C.SnowLabel center>Audio Compression</C.SnowLabel>
                <C.SnowDropdown
                    options={['No', 'Yes']}
                    onValueChange={chooseAudioCompression}
                    valueIndex={audioCompression === true ? 1 : 0} />
                <C.SnowLabel center>Hardware Decoder</C.SnowLabel>
                <C.SnowDropdown
                    options={['No', 'Yes']}
                    onValueChange={chooseHardwareDecoder}
                    valueIndex={hardwareDecoder === true ? 1 : 0} />
                <C.SnowGrid itemsPerRow={3} shrink>
                    <C.SnowTextButton title="Save" onPress={() => {
                        changeClientOptions({
                            resolutionWidth,
                            resolutionHeight,
                            audioCompression,
                            hardwareDecoder,
                            deviceId,
                        })
                    }} />
                </C.SnowGrid>
            </C.FillView>
        </C.FillView>

    )
}
