import React from 'react'
import { View, Switch, TouchableOpacity } from 'react-native'
import { SnowLabel } from './snow-label'

const styles = {
    center: {
        flex: 1,
        display: 'flex',
        marginLeft: 'auto',
        marginRight: 'auto'
    }
}

export function SnowToggle(props) {
    const toggleValue = () => {
        props.onValueChange(!props.value)
    }
    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={toggleValue}
            style={styles.center}>
            <SnowLabel>{props.title}</SnowLabel>
            <Switch
                style={{ marginLeft: 'auto', marginRight: 'auto' }}
                value={props.value}
                onValueChange={toggleValue} />
        </TouchableOpacity>
    )
}

export default SnowToggle