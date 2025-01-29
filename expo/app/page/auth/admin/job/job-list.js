import C from '../../../../common'

export default function ShelfEditPage() {
    const { signOut, apiClient } = C.useSession()
    const { routes, config } = C.useSettings()

    return (
        <C.View >
            <C.SnowText>TODO Show some jobs here</C.SnowText>
        </C.View >
    )
}
