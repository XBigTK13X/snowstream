import React from 'react'
import { TouchableOpacity, Keyboard } from 'react-native';
import SnowText from './snow-text'
import Style from '../snow-style'

const styles = {
    wrapper: {
        margin: 10,
        padding: 10,
        height: Style.textButton.wrapper.normal.height,
        justifyContent: 'center', // Horizontally center each line
        alignItems: 'center', // Vertically center each line
        alignContent: 'center', // Multiline vertical center of parent
        textAlign: 'center', // Ensure text objects are horitzontally centered
        backgroundColor: Style.color.core,
        borderWidth: 5,
        borderColor: Style.color.core,
        borderRadius: 5
    },
    tallWrapper: {
        height: 80,
        padding: 0
    },
    shortWrapper: {
        height: 10,
        margin: 1
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
        if (props.shouldFocus && !Keyboard.isVisible()) {
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

    if (props.tall) {
        wrapperStyle.push(styles.tallWrapper)
    }

    if (props.style) {
        wrapperStyle.push(props.style)
    }

    let textStyle = [styles.text]
    if (props.title.length > 18) {
        textStyle.push(styles.smallText)
    }

    if (props.short) {
        wrapperStyle.push(styles.shortWrapper)
        textStyle.push(styles.smallText)
    }

    const onPressUnlessTyping = () => {
        if (props.onPress && !Keyboard.isVisible()) {
            return props.onPress()
        }
    }

    const onLongPressUnlessTyping = () => {
        if (props.onLongPress && !Keyboard.isVisible()) {
            return props.onLongPress()
        }
    }

    const allowFocus = props.shouldFocus && !Keyboard.isVisible()

    return (
        <TouchableOpacity
            ref={touchRef}
            style={wrapperStyle}
            activeOpacity={1.0}

            onPress={onPressUnlessTyping}
            onLongPress={onLongPressUnlessTyping}

            hasTVPreferredFocus={allowFocus || focused}
            autoFocus={allowFocus}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            disabled={props.disabled}>
            <SnowText style={textStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowTextButton