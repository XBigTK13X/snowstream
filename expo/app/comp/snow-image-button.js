import React from 'react'


import { Platform, Image, TouchableOpacity, Pressable, View } from 'react-native';
import SnowText from './snow-text'

const missingPosterImage = require('../../assets/images/app/missing-poster.jpeg')
const missingScreencapImage = require('../../assets/images/app/missing-screencap.jpeg')


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
        height: 170 * mult,
        width: 200 * mult
    },
    wrapperSquare: {
        height: 250 * mult,
        width: 250 * mult
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
        height: 90 * mult,
        width: 150 * mult,
    },
    imageSquare: {
        height: 200 * mult,
        width: 200 * mult
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

if (Platform.OS === 'android') {
    styles.text.height = 80
    styles.text.marginTop = -10
}

export function SnowImageButton(props) {
    const [focused, setFocused] = React.useState(false)
    const touchRef = React.useRef(null)

    React.useEffect(() => {
        if (props.shouldFocus) {
            touchRef.current.focus()
        }
    }, [])

    let fontStyle = [styles.text]
    if (props.title && props.title.length > 20) {
        fontStyle.push({ fontSize: 15 * mult })
    }

    const wrapperStyle = [styles.wrapper]
    const imageStyle = [styles.image]
    if (props.wide) {
        wrapperStyle.push(styles.wrapperWide)
        imageStyle.push(styles.imageWide)
    }
    if (props.square) {
        wrapperStyle.push(styles.wrapperSquare)
        imageStyle.push(styles.imageSquare)
    }
    if (props.selected) {
        wrapperStyle.push(styles.selected)
    }
    if (focused) {
        wrapperStyle.push(styles.focused)
    }

    let imageSource = { uri: props.imageUrl }
    if (!props.imageUrl) {
        if (props.wide) {
            imageSource = missingScreencapImage
        } else {
            imageSource = missingPosterImage
        }
    }

    return (
        <TouchableOpacity
            ref={touchRef}
            activeOpacity={1.0}
            onPress={props.onPress}
            onLongPress={props.onLongPress}
            onFocus={() => { setFocused(true) }}
            onBlur={() => { setFocused(false) }}
            style={wrapperStyle}
            hasTVPreferredFocus={props.shouldFocus}
            autoFocus={props.shouldFocus}>
            <Image
                style={imageStyle}
                resizeMode="contain"
                source={imageSource} />
            <SnowText style={fontStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowImageButton