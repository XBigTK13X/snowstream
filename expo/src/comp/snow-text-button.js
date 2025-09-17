import React from 'react'
import { Pressable, Keyboard } from 'react-native';
import { useFocusContext } from '../focus-context'
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
        textAlign: 'center', // Ensure text objects are horizontally centered
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
    fade: {
        backgroundColor: Style.color.fade
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
    const { focusIsLocked } = useFocusContext()
    const [focused, setFocused] = React.useState(false)
    const touchRef = React.useRef(null)

    React.useEffect(() => {
        if (props.shouldFocus && !Keyboard.isVisible()) {
            touchRef.current.focus()
        }
    })

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

    if (props.fade) {
        wrapperStyle.push(styles.fade)
    }

    if (props.tall && Style.isWeb) {
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

    let allowFocus = !focusIsLocked && !Keyboard.isVisible()

    const changeFocus = (focus) => {
        if (!focusIsLocked) {
            setFocused(focus)
        }
        else {
            setFocused(false)
        }
    }

    return (
        <Pressable
            ref={touchRef}
            style={wrapperStyle}
            onPress={onPressUnlessTyping}
            onLongPress={onLongPressUnlessTyping}
            focusable={allowFocus || focused}
            onFocus={() => { changeFocus(true) }}
            onBlur={() => { changeFocus(false) }}
            disabled={props.disabled}>
            <SnowText noSelect style={textStyle}>{props.title}</SnowText>
        </Pressable>
    )
}

export default SnowTextButton