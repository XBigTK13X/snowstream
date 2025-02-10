import C from '../../common'

export default function OptionsPage() {
    let downloadButton = null
    return (
        <C.View>
            <C.Text style={{ color: 'white' }}>These are the options.</C.Text>
            <C.Button
                title="Download Latest APK"
                onPress={() => {
                    if (C.Platform.isTV) {
                        C.Linking.openURL('https://android.9914.us/snowstream-tv.apk')
                    } else {
                        C.Linking.openURL('https://android.9914.us/snowstream-mobile.apk')
                    }
                }}
            />
        </C.View>
    )
}
