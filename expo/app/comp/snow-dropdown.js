import React from 'react'
import { View } from 'react-native'
import { Button, ButtonGroup } from "@rneui/themed"

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
            return <Button title={option} />
        })}
        selectedIndex={selectedIndex}
        onPress={choose}
    />
}

export default SnowDropdown