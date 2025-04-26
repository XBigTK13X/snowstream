import React from 'react'

import { Button, Image } from '@rneui/themed'

import { TouchableOpacity } from 'react-native';

const baseButtonStyle = { margin: 5, padding: 10, maxWidth: 350, justifyContent: 'center' }
const selectedButtonStyle = { ...baseButtonStyle }
const hoverButtonStyle = { ...baseButtonStyle }

const baseContainerStyle = { margin: 5, maxWidth: 350 }
const selectedContainerStyle = { ...baseContainerStyle, ...{ backgroundColor: 'green' } }
const hoverContainerStyle = { ...baseContainerStyle, ...{ backgroundColor: 'white' } }

const longPressIcon = <Image
    style={{ height: 25, width: 25, marginRight: 10 }}
    source={require('../image/icon/long-press.png')}
    tintColor='#ffffff' />

export function SnowButton(props) {
    const [focused, setFocused] = React.useState(false)
    let buttonStyle = [baseButtonStyle]
    let containerStyle = [baseContainerStyle]
    let wrapperStyle = null
    if (props.selected) {
        buttonStyle = [selectedButtonStyle]
        containerStyle = [selectedContainerStyle]
    }
    if (focused) {
        buttonStyle = [hoverButtonStyle]
        containerStyle = [hoverContainerStyle]
    }
    if (props.styles) {
        if (props.styles.button) {
            buttonStyle.push(props.styles.button)
        }
        if (props.styles.container) {
            containerStyle.push(props.styles.container)
        }
        if (props.styles.wrapper) {
            wrapperStyle = props.styles.wrapper
        }
    }
    if (props.buttonStyle) {
        buttonStyle = { ...buttonStyle, ...props.buttonStyle }
    }

    if (props.containerStyle) {
        containerStyle = { ...containerStyle, ...props.containerStyle }
    }

    let icon = null
    if (props.onLongPress) {
        icon = longPressIcon
    }

    const gainFocus = () => {
        setFocused(true);
    }

    const loseFocus = () => {
        setFocused(false);
    }


    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onFocus={gainFocus}
            onBlur={loseFocus}
            style={wrapperStyle}>
            <Button
                buttonStyle={buttonStyle}
                containerStyle={containerStyle}
                icon={icon}
                title={props.title}
                onPress={props.onPress}
                onLongPress={props.onLongPress} />
        </TouchableOpacity>
    )
}

export default SnowButton