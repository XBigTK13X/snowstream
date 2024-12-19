import { View, Text, Linking, Platform } from 'react-native'
import { Button, ListItem } from '@rneui/themed'

export default function OptionsPage() {
    let downloadButton = null
    return (
        <View>
            <Text style={{ color: 'white' }}>These are the options.</Text>
            <Button
                title="Download Latest APK"
                onPress={() => {
                    if (Platform.isTV) {
                        console.log('Download the TV app')
                        Linking.openURL('https://android.9914.us/snowstream-tv.apk')
                    } else {
                        console.log('Download the movile app')
                        Linking.openURL('https://android.9914.us/snowstream-mobile.apk')
                    }
                }}
            />
        </View>
    )
}
