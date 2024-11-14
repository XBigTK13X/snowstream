import { Platform, FlatList } from 'react-native'

export default function HybridGrid(props) {
    if (Platform.OS === 'web') {
        return <FlatList />
    }
    let superGrid = require('react-native-super-grid')
    let SimpleGrid = superGrid.SimpleGrid
    return <SimpleGrid data={props.data} renderItem={props.renderItem} itemDimension={props.itemDimension} />
}