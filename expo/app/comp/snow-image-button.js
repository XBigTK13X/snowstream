import React from 'react'


import { Image, TouchableOpacity, Pressable, View } from 'react-native';
import SnowText from './snow-text'


const mult = 0.8

const styles = {
    wrapper: {
        height: 300 * mult,
        width: 200 * mult,
        margin: 10,
        padding: 10,
        alignContent: 'center',
        backgroundColor: 'rgb(219, 158, 44)',
        borderWidth: 5,
        borderColor: 'rgb(219, 158, 44)',
        borderRadius: 5,
    },
    wrapperWide: {
        height: 125 * mult,
        width: 200 * mult
    },
    selected: {
        borderColor: 'white'
    },
    focused: {
        borderColor: 'green'
    },
    image: {
        height: 215 * mult,
        width: 150 * mult,
        borderWidth: 5,
        borderColor: '#272727',
        backgroundColor: '#272727',
        marginBottom: 10,
        marginLeft: 5,
        borderRadius: 5
    },
    imageWide: {
        height: 100 * mult,
        width: 150 * mult,
    },
    text: {
        height: 80,
        color: '#272727',
        fontSize: 20 * mult,
        padding: 0,
        margin: 0,
        textAlign: 'center'
    },
}



export function SnowImageButton(props) {
    const [focused, setFocused] = React.useState(false)
    let fontStyle = [styles.text]
    if (props.title.length > 20) {
        fontStyle.push({ fontSize: 15 * mult })
    }

    const wrapperStyle = [styles.wrapper]
    if (props.wide) {
        wrapperStyle.push(styles.wrapperWide)
    }
    if (props.selected) {
        wrapperStyle.push(styles.selected)
    }
    if (focused) {
        wrapperStyle.push(styles.focused)
    }

    const imageStyle = [styles.image]
    if (props.wide) {
        imageStyle.push(styles.imageWide)
    }

    return (
        <TouchableOpacity
            activeOpacity={1.0}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            style={wrapperStyle}>
            <Image
                style={imageStyle}
                resizeMode="contain"
                source={{ uri: props.imageUrl }} />
            <SnowText style={fontStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowImageButton