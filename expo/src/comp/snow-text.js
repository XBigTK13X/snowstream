import { View, Text } from 'react-native'

import { StaticStyle } from '../snow-style'

const textStyle = {
    color: StaticStyle.color.text
}

const normalStyle = {
    margin: 10,
    padding: 10
}

const styles = {
    text: {
        color: StaticStyle.color.text
    },
    normal: {
        margin: 10,
        padding: 10
    },
    center: {
        width: '100%',
        alignItems: 'center'
    }
}


export function SnowText(props) {
    let style = [textStyle]
    if (!props.shrink) {
        style.push(normalStyle)
    }
    if (props.style) {
        style.push(props.style)
    }
    if (props.center) {
        return (
            <View style={styles.center}>
                <Text style={style} children={props.children} />
            </View>
        )
    }
    return <Text style={style} children={props.children} />
}

export default SnowText