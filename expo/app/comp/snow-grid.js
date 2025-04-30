import { Platform, Dimensions, View } from 'react-native'



const styles = {
    grid: {
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    item: {
        flexBasis: '20%'
    }
}

if (Platform.OS === 'android') {
}

export function SnowGrid(props) {
    let renderItem = (item) => {
        return item
    }
    if (props.renderItem) {
        renderItem = props.renderItem
    }
    return (
        <View style={styles.grid}>
            {props.items.map((item, itemIndex) => {
                return (
                    <View key={itemIndex} style={styles.item}>
                        {renderItem(item, itemIndex)}
                    </View>
                )
            })}
        </View>
    )
}

export default SnowGrid