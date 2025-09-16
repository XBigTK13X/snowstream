import { TextInput } from 'react-native'
import { useDebouncedCallback } from 'use-debounce'
import { useAppContext } from '../app-context'
import Style from '../snow-style'

const styles = {
    text: {
        border: 'solid white 2px',
        backgroundColor: Style.color.core,
        color: 'white',
        margin: 10,
        padding: 10
    },
    small: {
        margin: 1,
        padding: 1,
        fontSize: 10
    }
}

export function SnowInput(props) {
    const { config } = useAppContext()
    let textStyle = [styles.text]
    if (props.short) {
        textStyle.push(styles.small)
    }

    let onDebounce = null
    if (props.onDebounce) {
        onDebounce = useDebouncedCallback(props.onDebounce, config.debounceMilliseconds)
    }
    return <TextInput
        style={textStyle}
        secureTextEntry={props.secureTextEntry}
        focusable={props.shouldFocus}
        autoFocus={props.shouldFocus}
        onChangeText={(val) => {
            if (props.onValueChange) {
                props.onValueChange(val)
            }
            if (onDebounce) {
                onDebounce(val)
            }
        }}
        onSubmitEditing={props.onSubmit}
        value={props.value}
    />
}

export default SnowInput