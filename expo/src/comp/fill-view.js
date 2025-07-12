import { ScrollView, View } from 'react-native'
const styles = {
    default: {
        flex: 1
    }
}
export default function FillView(props) {
    // FlatList often overflows outside of the viewport without enabling scrolling.
    // This commonly happens when any parent container is not set to flex: 1
    let style = [styles.default]
    if (props.style) {
        style.push(props.style)
    }
    if (props.shrink) {
        style = []
    }
    const ViewKind = props.scroll ? ScrollView : View
    return (
        <ViewKind style={style} children={props.children} />
    )
}