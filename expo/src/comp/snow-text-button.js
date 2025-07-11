import React from 'react'


import { TouchableOpacity } from 'react-native';
import SnowText from './snow-text'
import Style from '../snow-style'

const styles = {
    wrapper: {
        margin: 10,
        padding: 10,
        height: Style.textButton.wrapper.normal.height,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: Style.color.core,
        borderWidth: 5,
        borderColor: Style.color.core,
        borderRadius: 5
    },
    selected: {
        borderColor: Style.color.active
    },
    focused: {
        borderColor: Style.color.hover
    },
    disabled: {
        opacity: 0.5
    },
    text: {
        fontSize: Style.textButton.fontSize.normal,
        padding: 0,
        margin: 0,
        textAlign: 'center',
        height: Style.textButton.textBox.height
    },
    smallText: {
        fontSize: Style.textButton.fontSize.small
    }
}

export function SnowTextButton(props) {
    const [focused, setFocused] = React.useState(false)
    const touchRef = React.useRef(null)

    React.useEffect(() => {
        if (props.shouldFocus) {
            touchRef.current.focus()
        }
    }, [])

    const wrapperStyle = [styles.wrapper]
    if (props.disabled) {
        wrapperStyle.push(styles.disabled)
    }
    else {
        if (props.selected) {
            wrapperStyle.push(styles.selected)
        }
        if (focused) {
            wrapperStyle.push(styles.focused)
        }
    }

    let textStyle = [styles.text]
    if (props.title.length > 18) {
        textStyle.push(styles.smallText)
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
            style={wrapperStyle}
            disabled={props.disabled}>
            <SnowText style={textStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowTextButton