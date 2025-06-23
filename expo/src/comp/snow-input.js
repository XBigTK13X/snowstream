import { TextInput } from 'react-native'

import { StaticStyle } from '../snow-style'

export function SnowInput(props) {
    return <TextInput
        style={{
            border: 'solid white 2px',
            backgroundColor: StaticStyle.color.core,
            color: 'white',
            margin: 10,
            padding: 10
        }}
        secureTextEntry={props.secureTextEntry}
        hasTVPreferredFocus={props.shouldFocus}
        autoFocus={props.shouldFocus}
        onChangeText={props.onChangeText}
        onSubmitEditing={props.onSubmit}
        value={props.value}
    />
}

export default SnowInput