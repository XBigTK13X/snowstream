import { View } from 'react-native'

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

    let itemStyle = defaultItemStyle

    if (props.itemStyle) {
        itemStyle = { ...itemStyle, ...props.itemStyle }
    }

    return (
        <View style={gridStyle}>
            {props.data.map((item, itemIndex) => {
                return (
                    <View key={itemIndex} style={itemStyle}>
                        {props.renderItem(item, itemIndex)}
                    </View>
                )
            })}
        </View>
    )
}

export default SnowGrid