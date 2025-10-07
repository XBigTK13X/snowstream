import React from 'react'
import { View } from 'react-native'
import {
    SnowTextButton,
    SnowGrid,
    SnowBreak
} from 'expo-snowui'
import { useAppContext } from 'snowstream'

// If the Header doesn't render before the rest of the page
// Then the focusMap winds up in the wrong focusLayer
// If this is pulled up to the root layout
// then browser refresh always sends you back to the root

const styles = {
    header: {
        width: '100%'
    }
}

function Header(props) {
    const { isAdmin, routes, displayName } = useAppContext()

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
                    onPress={routes.func(routes.landing)}
                />
                <SnowTextButton title="Sign Out" onPress={routes.func(routes.signOut)} />
                {isAdmin ? <SnowTextButton
                    title="Admin"
                    onPress={routes.func(routes.admin.dashboard)} />
                    : null}
                <SnowTextButton
                    title={`${displayName}`}
                    onPress={routes.func(routes.info)}
                    onLongPress={routes.func(routes.options)} />
            </SnowGrid>
            <SnowBreak />
        </View >
    )
}

export default function SnowHeaderPage(props) {
    const [headerReady, setHeaderReady] = React.useState(false)

    return (
        <View>
            <Header setHeaderReady={setHeaderReady} />
            {headerReady ? props.children : null}
        </View>
    )
}