import { View, Text } from 'react-native'

import Style from '../snow-style'

const textStyle = {
    color: Style.color.text
}

const normalStyle = {
    margin: 10,
    padding: 10
}

const styles = {
    text: {
        color: Style.color.text
    },
    normal: {
        margin: 10,
        padding: 10
    },
    center: {
        width: '100%',
        alignItems: 'center'
    },
    noSelect: {
        noSelect: {
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
        }
    }
}


export function SnowText(props) {
    let style = [textStyle]
    if (!props.shrink) {
        style.push(normalStyle)
    }
    if (props.noSelect) {
        style.push(styles.noSelect)
    }
    if (props.style) {
        style.push(props.style)
    }
    if (props.center) {
        return (
            <View style={styles.center}>
                <Text style={style} selectable={!props.noSelect} children={props.children} />
            </View>
        )
    }
    return <Text style={style} selectable={!props.noSelect} children={props.children} />
}

export default SnowText