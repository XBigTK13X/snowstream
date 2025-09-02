import { TextInput } from 'react-native'

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
    let textStyle = [styles.text]
    if (props.short) {
        textStyle.push(styles.small)
    }
    return <TextInput
        style={textStyle}
        secureTextEntry={props.secureTextEntry}
        focusable={props.shouldFocus}
        autoFocus={props.shouldFocus}
        onChangeText={props.onValueChange}
        onSubmitEditing={props.onSubmit}
        value={props.value}
    />
}

export default SnowInput