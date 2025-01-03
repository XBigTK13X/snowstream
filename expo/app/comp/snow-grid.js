import { Dimensions, Platform, FlatList, Text, View, TVFocusGuideView, ScrollView } from 'react-native'
import { SnowText } from './snow-text'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

export function SnowGrid(props) {
    if (Platform.OS === 'web') {
        return (
            <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={{ height: windowHeight * 0.66 }}>
                <View style={{ width: '100%', height: '100%', flex: 1, padding: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {props.data.map((item, itemIndex) => {
                        return (
                            <View key={itemIndex} style={{ width: 300, height: 30, margin: 10, padding: 10 }}>
                                {props.renderItem(item, itemIndex)}
                            </View>
                        )
                    })}
                </View>
            </ScrollView >
        )
    }
    let focusRenderItem = (item) => {
        let entry = item.item
        return (
            <TVFocusGuideView key={item.index} style={{ width: 300, height: 30 }}>
                {renderItem(entry)}
            </TVFocusGuideView>
        )
    }
    let superGrid = require('react-native-super-grid')
    let SimpleGrid = superGrid.SimpleGrid
    return <SimpleGrid data={props.data} renderItem={focusRenderItem} itemDimension={props.itemDimension} />
}

export default SnowGrid