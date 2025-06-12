import React from 'react'


import { Platform, Image, TouchableOpacity, Pressable, View } from 'react-native';
import SnowText from './snow-text'


const styles = {
    wrapper: {
        flex: 1,
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
        margin: 0,
        textAlign: 'center'
    },
}

if (Platform.OS === 'android') {
    styles.text.height = 30
}

export function SnowTextButton(props) {
    const [focused, setFocused] = React.useState(false)
    const touchRef = React.useRef(null)

    React.useEffect(() => {
        if (props.shouldFocus) {
            touchRef.current.focus()
        }
    }, [])

    const style = [styles.wrapper]
    if (props.selected) {
        style.push(styles.selected)
    }
    if (focused) {
        style.push(styles.focused)
    }

    let textStyle = [styles.text]
    if (props.title.length > 20) {
        textStyle.push({ fontSize: 12 })
    }

    return (
        <TouchableOpacity
            ref={touchRef}
            activeOpacity={1.0}
            onPress={props.onPress}
            hasTVPreferredFocus={props.shouldFocus}
            onLongPress={props.onLongPress}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            style={style}>
            <SnowText style={textStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowTextButton