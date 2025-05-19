import React from 'react'
import { Platform, View } from 'react-native'

const styles = {
    grid: {
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%'
    },
    item: {
        flexBasis: '20%'
    },
}

// TV and Tablet overrides
if (Platform.OS === 'android') {
    if (C.Platform.isTV) {

    }
    else {

    }
}

export function SnowGrid(props) {
    let itemStyle = [styles.item]
    if (props.itemsPerRow) {
        itemStyle.push({ flexBasis: `${100 / props.itemsPerRow}%` })
    }
    let gridStyle = [styles.grid]
    if (!props.items) {
        return (
            <View style={gridStyle}>
                {
                    React.Children.map(props.children, (child, childIndex) => {
                        return (
                            <View key={childIndex} style={itemStyle}>
                                {child}
                            </View>
                        )
                    })}
            </View>
        )
    }
    let renderItem = (item) => {
        return item
    }
    if (props.renderItem) {
        renderItem = props.renderItem
    }
    return (
        <View style={gridStyle}>
            {props.items.map((item, itemIndex) => {
                return (
                    <View key={itemIndex} style={itemStyle}>
                        {renderItem(item, itemIndex)}
                    </View>
                )
            })}
        </View>
    )
}

export default SnowGrid