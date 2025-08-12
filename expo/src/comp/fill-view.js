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
    if (props.scroll) {
        let viewStyle = []
        let scrollStyle = []
        if (!props.shrink) {
            viewStyle = [styles.default]
        }
        if (props.flexStart) {
            scrollStyle = [styles.flexStart]
        }
        if (props.style) {
            viewStyle.push(props.style)
        }
        return <ScrollView
            style={viewStyle}
            contentContainerStyle={scrollStyle}
            children={props.children}
        />
    }

    let style = []
    if (!props.shrink) {
        style = [styles.default]
    }
    if (props.flexStart) {
        style.push(styles.flexStart)
    }
    if (props.style) {
        style.push(props.style)
    }
    return (
        <View style={style} children={props.children} />
    )
}