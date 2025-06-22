import { StaticStyle } from '../snow-style'
import { Text } from 'react-native'

const styles = {
    header: {
        fontSize: StaticStyle.fontSize.header,
        color: StaticStyle.color.text,
        margin: 10,
        padding: 10
    }
}

export function SnowHeader(props) {
    let style = [styles.header]
    if (props.style) {
        style.push(props.style)
    }
    return <Text style={style}>{props.children}</Text>
}

export default SnowHeader