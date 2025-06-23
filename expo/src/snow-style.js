import { Platform } from 'react-native';

export const StaticStyle = {
    color: {
        background: 'black',
        text: 'white',
        textDark: 'rgb(22, 22, 22)',
        active: 'white',
        hover: 'rgb(119, 139, 255)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)'
    },
    fontSize: {
        header: 40,
        label: 26
    }
}

export const DynamicStyle = () => {
    let scaleMultiplier = 0.75
    if (Platform.isTV) {
        scaleMultiplier = 0.5
    }

    let scaled = (input) => {
        return Math.round(input * scaleMultiplier)
    }

    let style = {
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
                marginTop: 0
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
                height: 15
            }
        }
    }

    if (Platform.OS === 'android') {
        style.imageButton.textBox.marginTop = -10
        style.textButton.textBox.height = 25
    }

    return style
}


export default {
    StaticStyle,
    DynamicStyle
}
