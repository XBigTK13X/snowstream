import { View } from 'react-native'

styles = {
    grid: {
        width: '100%',
        height: '100%',
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    wide: {
    }
}

export function SnowGrid(props) {
    let style = [styles.grid]
    if (props.wide) {
        style.push(styles.wide)
    }
    return (
        <View style={style}>
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