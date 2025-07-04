import React from 'react'
import {
    View,
    FlatList
} from 'react-native'

const styles = {
    grid: {
        padding: 5
    },
    mainGrid: {
        flex: 1
    },
    item: {
        flexBasis: '20%'
    },
    list: {
        justifyContent: 'space-evenly',
        marginRight: 10
    },
    listColumn: {
        justifyContent: 'space-evenly',
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
    if (props.mainGrid) {
        gridStyle.push(styles.mainGrid)
    }
    let items = props.items
    if (!props.items) {
        // Without this, if a ternary `{x?x:null}` nullable component will leave a gap in the grid
        items = React.Children.toArray(props.children)
    }
    items = items.filter(child => child !== null)
    if (!items || !items.length) {
        return null
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
                scrollEnabled={props.scroll !== false}
                disableVirtualization={props.substantial}
                numColumns={itemsPerRow}
                contentContainerStyle={styles.list}
                columnWrapperStyle={itemsPerRow === 1 ? null : styles.listColumn}
                data={items}
                renderItem={({ item, index, separators }) => {
                    return (
                        <View key={index} style={itemStyle}>
                            {renderItem(item, index)}
                        </View>
                    )
                }}
            />
        </View>
    )
}

export default SnowGrid