import { Text } from 'react-native'
import { StaticStyle } from '../snow-style'

const styles = {
    label: {
        fontSize: StaticStyle.fontSize.label,
        color: StaticStyle.color.text,
        margin: 10,
        padding: 10
    }
}

export function SnowLabel(props) {
    return <Text style={styles.label}>{props.children}</Text>
}

export default SnowLabel