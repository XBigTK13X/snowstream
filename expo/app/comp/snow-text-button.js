import React from 'react'


import { Platform, Image, TouchableOpacity, Pressable, View } from 'react-native';
import SnowText from './snow-text'


const styles = {
    wrapper: {
        height: 60,
        width: 200,
        margin: 10,
        padding: 10,
        paddingTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'rgb(219, 158, 44)',
        borderWidth: 5,
        borderColor: 'rgb(219, 158, 44)',
        borderRadius: 5
    },
    selected: {
        borderColor: 'white'
    },
    focused: {
        borderColor: 'green'
    },
    text: {
        fontSize: 16,
        padding: 0,
        margin: 0
    },
}

if (Platform.OS === 'android') {
}

export function SnowTextButton(props) {
    const [focused, setFocused] = React.useState(false)

    const style = [styles.wrapper]
    if (props.selected) {
        style.push(styles.selected)
    }
    if (focused) {
        style.push(styles.focused)
    }

    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            style={style}>
            <SnowText style={styles.text}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowTextButton