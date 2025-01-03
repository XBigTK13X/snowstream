import { Button } from '@rneui/themed'

export function SnowButton(props) {
    return <Button style={{ margin: 10, padding: 10 }} title={props.title} onPress={props.onPress} />
}

export default SnowButton