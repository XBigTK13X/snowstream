import { Text } from 'react-native'

import { StaticStyle } from '../snow-style'

const textStyle = {
    color: StaticStyle.color.text
}

const normalStyle = {
    margin: 10,
    padding: 10
}

export function SnowText(props) {
    let styles = [textStyle]
    if (!props.shrink) {
        styles.push(normalStyle)
    }
    if (props.style) {
        styles.push(props.style)
    }
    return <Text style={styles}>{props.children}</Text>
}

export default SnowText