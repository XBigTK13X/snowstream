import React from 'react'
import { Platform, Image, TouchableOpacity } from 'react-native';
import SnowText from './snow-text'
import { StaticStyle, DynamicStyle } from '../snow-style'

const missingPosterImage = '../../assets/images/app/missing-poster.jpeg'
const missingScreencapImage = '../../assets/images/app/missing-screencap.jpeg'
// TODO hiddenPoster / hiddenScreencap


const dyn = DynamicStyle()

const styles = {
    wrapper: {
        height: dyn.imageButton.wrapper.normal.height,
        width: dyn.imageButton.wrapper.normal.width,
        margin: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 0,
        backgroundColor: StaticStyle.color.core,
        borderWidth: 5,
        borderColor: StaticStyle.color.core,
        borderRadius: 5,
    },
    wrapperWide: {
        height: dyn.imageButton.wrapper.wide.height,
        width: dyn.imageButton.wrapper.wide.width,
    },
    wrapperSquare: {
        height: dyn.imageButton.wrapper.square.height,
        width: dyn.imageButton.wrapper.square.width
    },
    selected: {
        borderColor: StaticStyle.color.active
    },
    focused: {
        borderColor: StaticStyle.color.hover
    },
    dull: {
        backgroundColor: StaticStyle.color.coreDark,
        borderColor: StaticStyle.color.coreDark,
    },
    image: {
        height: dyn.imageButton.image.normal.height,
        width: dyn.imageButton.image.normal.width,
        borderWidth: 2,
        borderColor: StaticStyle.color.outlineDark,
        backgroundColor: StaticStyle.color.outlineDark,
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 10,
        borderRadius: 6
    },
    imageWide: {
        height: dyn.imageButton.image.wide.height,
        width: dyn.imageButton.image.wide.width,
    },
    imageSquare: {
        height: dyn.imageButton.image.square.height,
        width: dyn.imageButton.image.square.width,
    },
    text: {
        height: 80,
        color: StaticStyle.color.textDark,
        fontSize: dyn.imageButton.fontSize.normal,
        fontWeight: 'bold',
        padding: 0,
        margin: 0,
        marginTop: dyn.imageButton.textBox.marginTop,
        textAlign: 'center'
    },
    smallText: {
        fontSize: dyn.imageButton.fontSize.small
    }
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
    let title = props.title
    if (title && title.length > 20) {
        fontStyle.push(styles.smallText)
    }

    if (title && title.length > 40) {
        title = title.substring(0, 40) + '...'
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

    if (props.dull) {
        wrapperStyle.push(styles.dull)
    }
    if (props.selected) {
        wrapperStyle.push(styles.selected)
    }
    if (focused) {
        wrapperStyle.push(styles.focused)
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
            hasTVPreferredFocus={props.shouldFocus || focused}
            autoFocus={props.shouldFocus}>
            <Image
                style={imageStyle}
                placeholder={{ uri: placeholder }}
                contentFit="contain"
                source={{ uri: props.imageUrl }} />
            <SnowText style={fontStyle}>{title}</SnowText>
        </TouchableOpacity>
    )
}

export default SnowImageButton