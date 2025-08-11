import React from 'react'
import { View } from 'react-native'
import SnowGrid from './snow-grid'
import SnowTextButton from './snow-text-button'
import SnowText from './snow-text'
import SnowLabel from './snow-label'

const styles = {
    fade: {

    }
}

export function SnowDropdown(props) {
    if (!props.options) {
        return <View>No options defined!</View>
    }

    const [selectedIndex, setSelectedIndex] = React.useState(props.valueIndex)

    const choose = (chosenIndex) => {
        setSelectedIndex(chosenIndex)
        if (props.onValueChange) {
            props.onValueChange(chosenIndex)
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
            tall
            fade={!selected && props.fade}
            selected={selected}
            title={item.name ? item.name : item}
            onPress={() => { choose(item.index ? item.index : itemIndex) }} />
    }

    if (props.title) {
        return <View>
            <SnowLabel center>{props.title}</SnowLabel>
            <SnowGrid itemsPerRow={props.itemsPerRow} shrink items={props.options} renderItem={renderItem} />
        </View>
    }
    return <SnowGrid itemsPerRow={props.itemsPerRow} shrink items={props.options} renderItem={renderItem} />
}

export default SnowDropdown