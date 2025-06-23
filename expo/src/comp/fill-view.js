import { ScrollView, View } from 'react-native'
export default function FillView(props) {
    // FlatList often overflows outside of the viewport without enabling scrolling.
    // This commonly happens when any parent container is not set to flex: 1
    style = [{ flex: 1 }]
    if (props.style) {
        style.push(props.style)
    }
    if (props.scroll) {
        return (
            <ScrollView style={style} children={props.children} />
        )
    }
    return (
        <View style={style} children={props.children} />
    )
}