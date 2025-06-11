import { Text } from 'react-native'

const styles = {
    label: {
        fontSize: 26,
        color: 'white',
        margin: 10,
        padding: 10
    }
}

export function SnowLabel(props) {
    return <Text style={styles.label}>{props.children}</Text>
}

export default SnowLabel