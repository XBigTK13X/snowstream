import { Text } from 'react-native'

export function SnowLabel(props) {
    return <Text style={{ fontSize: 26, color: 'white', margin: 10, padding: 10 }}>{props.children}</Text>
}

export default SnowLabel