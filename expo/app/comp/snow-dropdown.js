import React from 'react'
import { View } from 'react-native'
import { Button, ButtonGroup, Text } from "@rneui/themed"
import SnowText from './snow-text'

export function SnowDropdown(props) {
    if (!props.options) {
        return <View>No options defined!</View>
    }

    const [selectedIndex, setSelectedIndex] = React.useState(0)

    const choose = (chosenIndex) => {
        setSelectedIndex(chosenIndex)
        if (props.onChoose) {
            props.onChoose(chosenIndex)
        }
    }

    return <ButtonGroup
        buttons={props.options.map((option) => {
            return <Text>{option}</Text>
        })}
        selectedIndex={selectedIndex}
        onPress={choose}
    />
}

export default SnowDropdown