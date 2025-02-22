import { Button, Image } from '@rneui/themed'

const buttonStyle = { margin: 10, padding: 10, maxWidth: 350, justifyContent: 'center' }

const longPressIcon = <Image
    style={{ height: 25, width: 25, tintColor: '#ffffff', marginRight: 10 }}
    source={require('../image/icon/long-press.png')} />

export function SnowButton(props) {
    let icon = null
    if (props.onLongPress) {
        icon = longPressIcon
    }
    return <Button style={buttonStyle} icon={icon} title={props.title} onPress={props.onPress} onLongPress={props.onLongPress} />
}

export default SnowButton