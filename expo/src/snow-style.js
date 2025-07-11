import { Platform, Dimensions } from 'react-native';

const isTV = Platform.isTV
const isAndroid = Platform.OS === 'android'

const uhd = {
    width: 3840,
    height: 2160
}

let scaleMultiplier = 0.75

if (isTV) {
    scaleMultiplier = 0.5
}

const scaled = (input) => {
    return Math.round(input * scaleMultiplier)
}

export const Style = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgb(119, 139, 255)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)',
        transparentDark: 'rgba(0,0,0,0.6)'
    },
    fontSize: {
        header: 40,
        label: 26
    },
    depth: {
        video: {
            wrapper: 700,
            content: 800,
            toggle: 900,
            controls: 1000
        }
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
        height: () => {
            return isTV ? uhd.height : Dimensions.get('window').height
        },
        width: () => {
            return isTV ? uhd.width : Dimensions.get('window').width
        }
    },
    imageButton: {
        wrapper: {
            normal: {
                height: scaled(300),
                width: scaled(200)
            },
            wide: {
                height: scaled(170),
                width: scaled(200)
            },
            square: {
                height: scaled(250),
                width: scaled(250)
            }
        },
        image: {
            normal: {
                height: scaled(215),
                width: scaled(150)
            },
            wide: {
                height: scaled(90),
                width: scaled(150)
            },
            square: {
                height: scaled(200),
                width: scaled(200)
            }
        },
        fontSize: {
            normal: scaled(20),
            small: scaled(15)
        },
        textBox: {
            marginTop: isAndroid ? -10 : 0
        }
    },
    textButton: {
        wrapper: {
            normal: {
                height: 40
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


export default Style
