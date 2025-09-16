import { View } from 'react-native'
import Style from '../snow-style'

const styles = {
    hr: {
        borderBottomColor: Style.color.coreDark,
        borderBottomWidth: 2,
    }
}

export function SnowBreak() {
    return <View style={styles.hr} />
}

export default SnowBreak