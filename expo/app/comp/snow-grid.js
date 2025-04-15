import { Dimensions, Platform, FlatList, Text, View, ScrollView } from 'react-native'
import { SnowText } from './snow-text'

const windowWidth = Dimensions.get('window').width
const windowHeight = Dimensions.get('window').height

const gridStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
}

const defaultItemStyle = {
    width: 250,
    height: 60,
    padding: 0,
    margin: 5
}

export function SnowGrid(props) {
    const scrollStyle = {
        height: props.short ? (windowHeight * .15) : (windowHeight * 0.66)
    }

    let itemStyle = defaultItemStyle

    if (props.itemStyle) {
        itemStyle = { ...itemStyle, ...props.itemStyle }
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