import C from '../../../common'

export default function DashboardPage() {
    const { routes } = C.useSettings();
    const renderItem = (item) => {
        return <C.Button title={item.title} onPress={routes.func(item.route)} />
    }
    const buttons = [
        { title: 'Shelves', route: routes.admin.shelfList },
        { title: 'Stream Sources', route: routes.admin.streamSourceList },
        { title: 'Users', route: routes.admin.userList },
    ]
    return <C.SnowGrid data={buttons} renderItem={renderItem}></C.SnowGrid>
}
