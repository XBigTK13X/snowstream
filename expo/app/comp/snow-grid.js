import { Dimensions, View } from 'react-native'



const styles = {
    grid: {
        height: '100%',
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    item: {
        flexBasis: '20%'
    }
}

export function SnowGrid(props) {
    return (
        <View style={styles.grid}>
            {props.items.map((item, itemIndex) => {
                return (
                    <View key={itemIndex} style={styles.item}>
                        {props.renderItem(item, itemIndex)}
                    </View>
                )
            })}
        </View>
    )
}

export default SnowGrid