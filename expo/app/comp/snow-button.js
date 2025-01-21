import { Button } from '@rneui/themed'

export function SnowButton(props) {
    return <Button style={{ margin: 10, padding: 10, maxWidth: 350, justifyContent: 'center' }} title={props.title} onPress={props.onPress} />
}

export default SnowButton