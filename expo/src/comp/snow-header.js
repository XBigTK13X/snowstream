import { Text } from 'react-native'

const styles = {
    label: {
        fontSize: 40,
        color: 'white',
        margin: 10,
        padding: 10
    }
}

export function SnowHeader(props) {
    return <Text style={styles.label}>{props.children}</Text>
}

export default SnowHeader