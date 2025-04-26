import { Text } from 'react-native'

const textStyle = { color: 'white', margin: 10, padding: 10 }

const headingStyle = { color: 'white', margin: 5, padding: 5, fontSize: 20 }

export function SnowText(props) {
    let styles = [textStyle]
    if (props.heading) {
        styles = [headingStyle]
    }
    styles.push(props.style)
    return <Text style={styles}>{props.children}</Text>
}

export default SnowText