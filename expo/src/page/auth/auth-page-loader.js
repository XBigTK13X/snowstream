import React from 'react'
import { C, useAppContext } from 'snowstream'
import Snow, {
    SnowTextButton,
    SnowGrid,
    SnowBreak
} from 'expo-snowui'

const styles = {
    header: {
        width: '100%'
    }
}

function HeaderNav(props) {
    const { navPush, navPop } = C.useSnowContext()
    const { displayName, routes, isAdmin, signOut } = useAppContext();

    return (
        <Snow.View yy={0} style={styles.header}>
            <SnowGrid
                focusKey="header" >
                <SnowTextButton
                    title="Home"
                    short
                    onPress={navPush({ path: routes.landing })}
                />
                <SnowTextButton title="Sign Out" short onPress={signOut} />
                {isAdmin ? <SnowTextButton
                    title="Dashboard"
                    short
                    onPress={navPush({ path: routes.adminDashboard })} />
                    : null}
                <SnowTextButton
                    title={`${displayName}`}
                    short
                    onPress={navPush({ path: routes.info })}
                    onLongPress={navPush({ path: routes.options })} />
                <SnowTextButton
                    title={`Back`}
                    short
                    onPress={navPop(true)} />
            </SnowGrid>
            <SnowBreak />
        </Snow.View >
    )
}

function SnowHeaderNavPage(props) {
    const { displayName, routes } = useAppContext();

    return (
        <>
            <HeaderNav
                yy={0}
                displayName={displayName}
                routes={routes} />
            <Snow.View yy={1}>
                {props.children}
            </Snow.View>
        </>
    )
}

export default function AuthPageLoader(props) {
    const { apiClient, session, sessionLoaded, isAdmin, routes } = useAppContext();
    const { CurrentPage, currentRoute, navPush } = Snow.useSnowContext()
    const [hasAuth, setHasAuth] = React.useState(false)

    React.useEffect(() => {
        if (!hasAuth) {
            if (currentRoute.routePath.includes('/auth/') && sessionLoaded && !session) {
                setHasAuth(true)
                navPush({ path: routes.signIn, func: false })
            }

            if (currentRoute.routePath.includes('/admin/') && sessionLoaded && !isAdmin) {
                setHasAuth(true)
                navPush({ path: routes.landing, func: false })
            }
        }
    }, [hasAuth, session, sessionLoaded, isAdmin, currentRoute])

    if (!apiClient) {
        return null
    }

    const hasHeader = currentRoute.routePath.includes('/wrap/')
    if (hasHeader) {
        return (
            <SnowHeaderNavPage>
                <CurrentPage />
            </SnowHeaderNavPage>
        )
    }
    return (
        <CurrentPage />
    )
}
