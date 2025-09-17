import React from 'react'
import { TouchableOpacity, View, Platform } from 'react-native';
import SnowText from './snow-text'
import { Style } from '../snow-style'
import { Image } from 'expo-image'

const styles = {
    wrapper: {
        height: Style.imageButton.wrapper.normal.height,
        width: Style.imageButton.wrapper.normal.width,
        margin: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderColor: Style.color.background,
        borderWidth: 2,
        borderRadius: 2,
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
        marginTop: 5,
        paddingBottom: 5,
        marginLeft: 'auto',
        marginRight: 'auto'
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
        height: 25,
        color: Style.color.textDark,
        fontSize: Style.imageButton.fontSize.normal,
        fontWeight: 'bold',
        padding: 0,
        margin: 0,
        textAlign: 'center'
    },
    smallText: {
        fontSize: Style.imageButton.fontSize.small
    },
    textWrapper: {
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 5,
        width: '100%',
        height: 41,
        backgroundColor: Style.color.core,
        borderColor: Style.color.core,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
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

    let textWrapperStyle = [styles.textWrapper]

    if (props.dull) {
        textWrapperStyle.push(styles.dull)
    }
    if (props.selected) {
        wrapperStyle.push(styles.selected)
        textWrapperStyle.push(styles.selected)
    }
    if (focused && Platform.isTV) {
        wrapperStyle.push(styles.focused)
        textWrapperStyle.push(styles.focused)
    }


    return (
        <View>

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
                    contentFit="contain"
                    source={{ uri: props.imageUrl }}
                    placeholder={props.placeholder}
                />
                <View style={textWrapperStyle}>
                    <SnowText style={fontStyle}>{title}</SnowText>
                </View>

            </TouchableOpacity>
        </View>
    )
}

export default SnowImageButton