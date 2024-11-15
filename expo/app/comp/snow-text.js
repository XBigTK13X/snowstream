import { Text } from 'react-native'

export function SnowText(props) {
    return <Text style={{ color: 'white', margin: 10, padding: 10 }}>{props.children}</Text>
}

export default SnowText