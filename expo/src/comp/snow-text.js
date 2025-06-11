import { Text } from 'react-native'

const textStyle = { color: 'white', margin: 10, padding: 10, height: 50 }

const headingStyle = { color: 'white', margin: 5, padding: 5, fontSize: 20, height: 50 }

const dynamicHeightStyle = { color: 'white', margin: 10, padding: 10 }

export function SnowText(props) {
    let styles = []
    if (props.stretch) {
        styles.push(dynamicHeightStyle)
    }
    else {
        styles.push(textStyle)
    }
    if (props.heading) {
        styles = [headingStyle]
    }
    if (props.style) {
        styles.push(props.style)
    }
    return <Text style={styles}>{props.children}</Text>
}

export default SnowText