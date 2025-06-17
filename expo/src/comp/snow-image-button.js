import React from 'react'


import { Platform, Image, TouchableOpacity } from 'react-native';
import SnowText from './snow-text'

const missingPosterImage = '../../assets/images/app/missing-poster.jpeg'
const missingScreencapImage = '../../assets/images/app/missing-screencap.jpeg'




let mult = 0.75

if (Platform.isTV) {
    mult = 0.5
}

const styles = {
    wrapper: {
        height: 300 * mult,
        width: 200 * mult,
        margin: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 0,
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
    dull: {
        backgroundColor: 'rgb(136, 98, 27)',
        borderColor: 'rgb(136, 98, 27)',
    },
    image: {
        height: 215 * mult,
        width: 150 * mult,
        borderWidth: 2,
        borderColor: '#272727',
        backgroundColor: '#272727',
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 10,
        borderRadius: 6
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
    if (props.dull) {
        wrapperStyle.push(styles.dull)
    }

    let placeholder = props.wide ? missingScreencapImage : missingPosterImage

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
                placeholder={{ uri: placeholder }}
                contentFit="contain"
                source={{ uri: props.imageUrl }} />
            <SnowText style={fontStyle}>{props.title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowImageButton