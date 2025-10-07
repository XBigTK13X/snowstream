import C from '../common'

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
    const { isAdmin, routes, displayName } = C.useAppContext()

    C.React.useEffect(() => {
        props.setHeaderReady(true)
    })

    return (
        <C.View style={styles.header}>
            <C.SnowGrid
                focusKey="header"
                focusDown="page-entry">
                <C.SnowTextButton
                    title="Home"
                    onPress={routes.func(routes.landing)}
                />
                <C.SnowTextButton title="Sign Out" onPress={routes.func(routes.signOut)} />
                {isAdmin ? <C.SnowTextButton
                    title="Admin"
                    onPress={routes.func(routes.admin.dashboard)} />
                    : null}
                <C.SnowTextButton
                    title={`${displayName}`}
                    onPress={routes.func(routes.info)}
                    onLongPress={routes.func(routes.options)} />
            </C.SnowGrid>
            <C.SnowBreak />
        </C.View >
    )
}

export default function SnowHeaderPage(props) {
    const [headerReady, setHeaderReady] = C.React.useState(false)

    return (
        <C.View>
            <Header setHeaderReady={setHeaderReady} />
            {headerReady ? props.children : null}
        </C.View>
    )
}