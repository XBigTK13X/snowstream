import React from 'react'


import { Image, TouchableOpacity, Pressable, View } from 'react-native';
import SnowText from './snow-text'


const styles = {
    wrapper: {
        height: 300,
        width: 200,
        margin: 10,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(219, 158, 44)',
        borderWidth: 10,
        borderColor: 'rgb(219, 158, 44)',
    },
    selected: {
        borderColor: 'white'
    },
    focused: {
        borderColor: 'green'
    },
    border: {
        height: 280,
        width: 180,
        backgroundColor: 'rgb(219, 158, 44)'
    },
    image: {
        height: 250,
        width: 150
    },
    text: {
        height: 15,
        color: '#272727',
        fontSize: 20,
        padding: 0,
        margin: 0
    },
}

export function SnowImageButton(props) {
    const [focused, setFocused] = React.useState(false)

    const style = [styles.wrapper]
    if (props.selected) {
        style.push(styles.selected)
    }
    if (focused) {
        style.push(styles.focused)
    }

    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            style={style}>
            <Image
                style={styles.image}
                resizeMode="contain"
                source={{ uri: props.imageUrl }} />
            <SnowText style={styles.text}>Title</SnowText>
        </TouchableOpacity>
    )
}

export default SnowImageButton