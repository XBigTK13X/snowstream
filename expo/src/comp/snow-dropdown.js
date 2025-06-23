import React from 'react'
import { View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowTextButton from './snow-text-button'
import SnowText from './snow-text'

export function SnowDropdown(props) {
    if (!props.options) {
        return <View>No options defined!</View>
    }

    const [selectedIndex, setSelectedIndex] = React.useState(props.selected)

    const choose = (chosenIndex) => {
        setSelectedIndex(chosenIndex)
        if (props.onChoose) {
            props.onChoose(chosenIndex)
        }
    }

    const renderItem = (item, itemIndex) => {
        let selected = false
        if (!props.skipDefaultFocus) {
            if ((itemIndex === selectedIndex) || (!selectedIndex && itemIndex === 0)) {
                selected = true
            }
        }
        return <SnowTextButton
            selected={selected}
            title={item.name ? item.name : item}
            onPress={() => { choose(item.index ? item.index : itemIndex) }} />
    }

    return <SnowGrid substantial items={props.options} renderItem={renderItem} />
}

export default SnowDropdown