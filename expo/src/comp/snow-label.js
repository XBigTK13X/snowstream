import { View, Text } from 'react-native'
import { StaticStyle } from '../snow-style'

const styles = {
    label: {
        fontSize: StaticStyle.fontSize.label,
        color: StaticStyle.color.text,
        margin: 10,
        padding: 10
    },
    center: {
        alignItems: 'center',
        width: '100%'
    }
}

export function SnowLabel(props) {
    if (props.center) {
        return (
            <View style={styles.center}>
                <Text style={styles.label} children={props.children} />
            </View>
        )
    }
    return <Text style={styles.label} children={props.children} />
}

export default SnowLabel