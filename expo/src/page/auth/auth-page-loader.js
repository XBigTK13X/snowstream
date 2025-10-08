import React from 'react'
import { View } from 'react-native'
import { C, useAppContext } from 'snowstream'
import {
    SnowTextButton,
    SnowGrid,
    SnowBreak
} from 'expo-snowui'
import { Pages } from '../../pages'


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

function CurrentAuthPage(props) {
    const { currentRoute } = useAppContext()
    const Page = Pages[currentRoute.route]
    if (!Page) {
        return <C.SnowText>Unmapped route {currentRoute.route}</C.SnowText>
    }
    return <Page />
}

export default function AuthPageLoader(props) {
    const { apiClient, session, sessionLoaded, isAdmin, routes, navPush, currentRoute } = useAppContext();
    const [hasAuth, setHasAuth] = React.useState(false)

    React.useEffect(() => {
        if (!hasAuth) {
            if (currentRoute.route.includes('/auth/') && sessionLoaded && !session) {
                setHasAuth(true)
                navPush(routes.signIn)
            }

            if (currentRoute.route.includes('/admin/') && sessionLoaded && !isAdmin) {
                setHasAuth(true)
                navPush(routes.landing)
            }
        }
    }, [hasAuth, session, sessionLoaded, isAdmin, currentRoute])

    if (!apiClient) {
        return null
    }

    const hasHeader = currentRoute.route.includes('/wrap/')
    const HeaderWrapper = hasHeader ? SnowHeaderNavPage : NoOp

    return (
        <HeaderWrapper>
            <CurrentAuthPage />
        </HeaderWrapper>
    )
}
