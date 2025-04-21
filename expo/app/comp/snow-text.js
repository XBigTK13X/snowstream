import { Text } from 'react-native'

const textStyle = { color: 'white', margin: 10, padding: 10 }

export function SnowText(props) {
    let style = textStyle
    if (props.style) {
        style = { ...style, ...props.style }
    }
    return <Text style={style}>{props.children}</Text>
}

export default SnowText