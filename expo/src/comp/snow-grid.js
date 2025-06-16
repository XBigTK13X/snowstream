import React from 'react'
import {
    Platform,
    View,
    FlatList
} from 'react-native'

const styles = {
    grid: {
        padding: 5,
        margin: 0,
        width: '100%'
    },
    item: {
        flexBasis: '20%'
    },
    list: {
        justifyContent: 'center',
        width: '100%'
    },
    listColumn: {
        justifyContent: 'center',
    }
}

export function SnowGrid(props) {
    if (!props.items && !props.children) {
        return null
    }
    let itemStyle = [styles.item]
    let itemsPerRow = 5
    if (props.itemsPerRow) {
        itemsPerRow = props.itemsPerRow
        itemStyle.push({ flexBasis: `${100 / props.itemsPerRow}%` })
    }
    let gridStyle = [styles.grid]
    if (props.gridStyle) {
        gridStyle.push(props.gridStyle)
    }
    let items = props.items
    if (!props.items) {
        // Without this, if a ternary `{x?x:null}` nullable component will leave a gap in the grid
        const children = React.Children.toArray(props.children).filter(child => child !== null)
        if (!children || !children.length) {
            return null
        }
        items = children
    }
    let renderItem = (item, itemIndex) => {
        return item
    }
    if (props.renderItem) {
        renderItem = props.renderItem
    }
    return (
        <View style={gridStyle}>
            <FlatList
                key={itemsPerRow}
                numColumns={itemsPerRow}
                contentContainerStyle={styles.list}
                columnWrapperStyle={itemsPerRow === 1 ? null : styles.listColumn}
                data={items}
                renderItem={({ item, itemIndex, separators }) => {
                    return (
                        <View key={itemIndex} style={itemStyle}>
                            {renderItem(item, itemIndex)}
                        </View>
                    )
                }}
            />
        </View >
    )
}

export default SnowGrid