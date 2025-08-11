import { ScrollView, View } from 'react-native'
const styles = {
    default: {
        flex: 1
    },
    flexStart: {
        justifyContent: 'flex-start'
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
    if (props.flexStart) {
        style.push(styles.flexStart)
    }
    if (props.scroll) {
        return <ScrollView
            contentContainerStyle={style}
            children={props.children}
        />
    }
    return (
        <View style={style} children={props.children} />
    )
}