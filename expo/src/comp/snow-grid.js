import React from 'react'
import { Platform, View } from 'react-native'

const styles = {
    grid: {
        padding: 5,
        margin: 0,
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
    if (Platform.isTV) {

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
        // Without this, if a ternary `{x?x:null}` nullable component will leave a gap in the grid
        const children = React.Children.toArray(props.children).filter(child => child !== null)
        if (!children || !children.length) {
            return null
        }
        return (
            <View style={gridStyle}>
                {
                    children.map((child, childIndex) => {
                        return (
                            <View key={childIndex} style={itemStyle}>
                                {child}
                            </View>
                        )
                    })}
            </View>
        )
    }
    let renderItem = (item, itemIndex) => {
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