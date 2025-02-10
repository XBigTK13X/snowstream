import { Dimensions, Platform, FlatList, Text, View, ScrollView } from 'react-native'
import { SnowText } from './snow-text'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

export function SnowGrid(props) {

    let scrollStyle = {
        height: props.short ? (windowHeight * .15) : (windowHeight * 0.66)
    }

    let gridStyle = {
        width: '100%',
        height: '100%',
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap'
    }

    let itemStyle = {
        width: props.itemWidth || 250,
        height: props.itemHeight || 60,
        padding: 10,
        margin: 10
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={props.short ? false : true}
            persistentScrollbar={props.short ? false : true}
            style={scrollStyle}>
            <View style={gridStyle}>
                {props.data.map((item, itemIndex) => {
                    return (
                        <View key={itemIndex} style={itemStyle}>
                            {props.renderItem(item, itemIndex)}
                        </View>
                    )
                })}
            </View>
        </ScrollView >
    )
}

export default SnowGrid