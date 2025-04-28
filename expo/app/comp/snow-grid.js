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

export function SnowGrid(props) {
    return (
        <View style={gridStyle}>
            {props.data.map((item, itemIndex) => {
                return (
                    <View key={itemIndex}>
                        {props.renderItem(item, itemIndex)}
                    </View>
                )
            })}
        </View>
    )
}

export default SnowGrid