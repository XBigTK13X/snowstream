import { Input } from '@rneui/themed'

export function SnowInput(props) {
    return <Input
        style={{
            border: 'solid white 2px',
            backgroundColor: 'rgb(219, 158, 44)',
            color: 'white',
            margin: 10,
            padding: 10
        }}
        onChangeText={props.onChangeText}
        value={props.value}
    />
}

export default SnowInput