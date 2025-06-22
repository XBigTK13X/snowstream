import { Text } from 'react-native'

import { StaticStyle } from '../snow-style'

const textStyle = {
    color: StaticStyle.color.text,
    margin: 10,
    padding: 10,
    height: StaticStyle.textBox.normal.height
}

const dynamicHeightStyle = {
    color: StaticStyle.color.text,
    margin: 10,
    padding: 10
}

export function SnowText(props) {
    let styles = []
    if (props.stretch) {
        styles.push(dynamicHeightStyle)
    }
    else {
        styles.push(textStyle)
    }
    if (props.style) {
        styles.push(props.style)
    }
    return <Text style={styles}>{props.children}</Text>
}

export default SnowText