import { View } from 'react-native'
export default function FillView(props) {
    // FlatList often overflows outside of the viewport without enabling scrolling.
    // This commonly happens when any parent container is not set to flex: 1
    return (
        <View style={{ flex: 1 }} children={props.children} />
    )
}