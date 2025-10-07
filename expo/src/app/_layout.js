import Snow from 'expo-snowui'
import { AppContextProvider, C, config } from 'snowstream'

const appStyle = {
    color: {
        background: 'black',
        text: 'rgb(235, 235, 235)',
        textDark: 'rgb(22, 22, 22)',
        active: 'rgb(150, 150, 150)',
        hover: 'rgb(119, 139, 255)',
        hoverDark: 'rgba(83, 97, 177, 1)',
        core: 'rgb(219, 158, 44)',
        coreDark: 'rgb(136, 98, 27)',
        outlineDark: 'rgb(63, 63, 63)',
        fade: 'rgb(23, 23, 23)',
        transparentDark: 'rgba(0,0,0,0.6)',
        panel: 'rgb(50,50,50)'
    }
}

export default function RootLayout() {
    return (
        <Snow.App DEBUG_FOCUS={config.debugFocus} snowStyle={appStyle}>
            <AppContextProvider>
                <C.Slot />
            </AppContextProvider >
        </Snow.App >
    )
}
