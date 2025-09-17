import { Platform, Dimensions } from 'react-native';

const isTV = Platform.isTV
const isAndroid = Platform.OS === 'android'
const isWeb = Platform.OS === 'web'
const isPortrait = Dimensions.get('window').width < Dimensions.get('window').height

let scaleMultiplier = 0.75

if (isTV) {
    scaleMultiplier = 0.5
}

const scaled = (input) => {
    return Math.round(input * scaleMultiplier)
}

let AppStyle = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgb(119, 139, 255)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)',
        fade: 'rgb(23, 23, 23)',
        transparentDark: 'rgba(0,0,0,0.6)'
    },
    fontSize: {
        header: 40,
        label: 26
    },
    window: {
        height: () => {
            return Dimensions.get('window').height
        },
        width: () => {
            return Dimensions.get('window').width
        }
    },
    surface: {
        uhd: {
            width: 3840,
            height: 2160
        },
        fhd: {
            width: 1920,
            height: 1080
        }
    },
    imageButton: {
        wrapper: {
            normal: {
                height: scaled(425),
                width: scaled(310)
            },
            wide: {
                height: scaled(280),
                width: scaled(310)
            },
            square: {
                height: scaled(250),
                width: scaled(250)
            }
        },
        image: {
            normal: {
                height: scaled(315),
                width: scaled(260)
            },
            wide: {
                height: scaled(165),
                width: scaled(260)
            },
            square: {
                height: scaled(200),
                width: scaled(200)
            }
        },
        fontSize: {
            normal: scaled(25),
            small: scaled(20)
        },
        textBox: {
            marginTop: isAndroid ? -10 : 0
        }
    },
    textButton: {
        wrapper: {
            normal: {
                height: 35
            }
        },
        fontSize: {
            normal: 16,
            small: 12
        },
        textBox: {
            height: isAndroid ? 25 : 15
        }
    }
}

if (isWeb) {
    AppStyle.page = {
        height: AppStyle.window.height() - 50
    }
} else {
    AppStyle.page = {
        height: AppStyle.window.height() - 25
    }
}

export const Style = AppStyle

export default AppStyle
