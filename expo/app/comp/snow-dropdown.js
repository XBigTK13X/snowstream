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
        return <SnowTextButton
            selected={itemIndex === selectedIndex}
            title={item}
            onPress={() => { choose(itemIndex) }} />
    }

    return <SnowGrid items={props.options} renderItem={renderItem} />
}

export default SnowDropdown