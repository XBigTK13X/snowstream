import React from 'react'
import { View } from 'react-native'
import { C, useAppContext } from 'snowstream'
import {
    SnowTextButton,
    SnowGrid,
    SnowBreak
} from 'expo-snowui'


// If the Header doesn't render before the rest of the page
// Then the focusMap winds up in the wrong focusLayer
// If this is pulled up to the root layout
// then browser refresh always sends you back to the root

const styles = {
    header: {
        width: '100%'
    }
}

function HeaderNav(props) {
    const { displayName, routes, isAdmin, navPush } = useAppContext();

    React.useEffect(() => {
        props.setHeaderReady(true)
    })

    return (
        <View style={styles.header}>
            <SnowGrid
                focusKey="header"
                focusDown="page-entry">
                <SnowTextButton
                    title="Home"
                    onPress={navPush(routes.landing, true)}
                />
                <SnowTextButton title="Sign Out" onPress={navPush(props.routes.signOut, true)} />
                {isAdmin ? <SnowTextButton
                    title="Admin"
                    onPress={navPush(routes.admin.dashboard, true)} />
                    : null}
                <SnowTextButton
                    title={`${displayName}`}
                    onPress={navPush(routes.info, true)}
                    onLongPress={navPush(routes.options, true)} />
            </SnowGrid>
            <SnowBreak />
        </View >
    )
}

function SnowHeaderNavPage(props) {
    const { displayName, routes } = useAppContext();
    const [headerReady, setHeaderReady] = React.useState(false)

    return (
        <View>
            <HeaderNav
                displayName={displayName}
                routes={routes}
                setHeaderReady={setHeaderReady} />
            {headerReady ? props.children : null}
        </View>
    )
}

function NoOp(props) {
    return <>{props.children}</>
}

// Each wrapper was previously a layout.
// However, at one point the players were moved into a sibling dir to remove the header
// That broke back navigation
// But, the contexts don't work unless they are inside a top level Slot
// So the RootLayout bootstraps expo-router
// Then this layout bootstraps the app
export default function AppLayout() {
    const pathname = C.usePathname()
    const { session, sessionLoaded, isAdmin, routes } = useAppContext();
    const [hasAuth, setHasAuth] = React.useState(false)

    React.useEffect(() => {
        if (!hasAuth) {
            if (pathname.includes('/auth/') && sessionLoaded && !session) {
                setHasAuth(true)
                routes.replace(routes.signIn)
            }

            if (pathname.includes('/admin/') && sessionLoaded && !isAdmin) {
                setHasAuth(true)
                routes.replace(routes.landing)
            }
        }
    })

    const hasHeader = pathname.includes('/wrap/')
    const HeaderWrapper = hasHeader ? SnowHeaderNavPage : NoOp

    return (
        <HeaderWrapper>
            <C.Slot />
        </HeaderWrapper>
    )
}
