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
        return null
    }
    if (props.valueIndex === undefined || props.valueIndex === null) {
        return null
    }

    const choose = (chosenIndex) => {
        if (props.onValueChange) {
            props.onValueChange(chosenIndex)
        }
    }

    const renderItem = (item, itemIndex) => {
        let selected = false
        if (!props.skipDefaultFocus) {
            if (itemIndex === props.valueIndex) {
                selected = true
            }
        }
        return <SnowTextButton
            tall={!props.short}
            fade={selected && props.fade}
            selected={selected}
            title={item.name ? item.name : item}
            onPress={() => { choose(item.index ? item.index : itemIndex) }} />
    }

    if (props.title) {
        return <View>
            <SnowLabel center>{props.title}</SnowLabel>
            <SnowGrid itemsPerRow={props.itemsPerRow} items={props.options} renderItem={renderItem} />
        </View>
    }
    return <SnowGrid itemsPerRow={props.itemsPerRow} items={props.options} renderItem={renderItem} />
}

export default SnowDropdown