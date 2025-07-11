import React from 'react'
import { Platform, Image, TouchableOpacity } from 'react-native';
import SnowText from './snow-text'
import Style from '../snow-style'

const missingPosterImage = '../../assets/images/app/missing-poster.jpeg'
const missingScreencapImage = '../../assets/images/app/missing-screencap.jpeg'
// TODO hiddenPoster / hiddenScreencap


const styles = {
    wrapper: {
        height: Style.imageButton.wrapper.normal.height,
        width: Style.imageButton.wrapper.normal.width,
        margin: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 0,
        backgroundColor: Style.color.core,
        borderWidth: 5,
        borderColor: Style.color.core,
        borderRadius: 5,
    },
    wrapperWide: {
        height: Style.imageButton.wrapper.wide.height,
        width: Style.imageButton.wrapper.wide.width,
    },
    wrapperSquare: {
        height: Style.imageButton.wrapper.square.height,
        width: Style.imageButton.wrapper.square.width
    },
    selected: {
        borderColor: Style.color.active
    },
    focused: {
        borderColor: Style.color.hover
    },
    dull: {
        backgroundColor: Style.color.coreDark,
        borderColor: Style.color.coreDark,
    },
    image: {
        height: Style.imageButton.image.normal.height,
        width: Style.imageButton.image.normal.width,
        borderWidth: 2,
        borderColor: Style.color.outlineDark,
        backgroundColor: Style.color.outlineDark,
        marginTop: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 10,
        borderRadius: 6
    },
    imageWide: {
        height: Style.imageButton.image.wide.height,
        width: Style.imageButton.image.wide.width,
    },
    imageSquare: {
        height: Style.imageButton.image.square.height,
        width: Style.imageButton.image.square.width,
    },
    text: {
        height: 80,
        color: Style.color.textDark,
        fontSize: Style.imageButton.fontSize.normal,
        fontWeight: 'bold',
        padding: 0,
        margin: 0,
        marginTop: Style.imageButton.textBox.marginTop,
        textAlign: 'center'
    },
    smallText: {
        fontSize: Style.imageButton.fontSize.small
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