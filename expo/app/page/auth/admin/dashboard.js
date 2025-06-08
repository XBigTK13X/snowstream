import C from '../../../common'

export default function AdminDashboardPage() {
    const { routes } = C.useSettings();
    const renderItem = (item) => {
        return <C.SnowTextButton title={item.title} onPress={routes.func(item.route)} />
    }
    const buttons = [
        { title: 'Run Job', route: routes.admin.jobRunner },
        { title: 'Logs', route: routes.admin.logViewer },
        { title: 'Shelves', route: routes.admin.shelfList },
        { title: 'Stream Sources', route: routes.admin.streamSourceList },
        { title: 'Users', route: routes.admin.userList },
        { title: 'Tags', route: routes.admin.tagList },
        { title: 'Job List', route: routes.admin.jobList },
    ]
    return <C.SnowGrid items={buttons} renderItem={renderItem} itemsPerRow={3}></C.SnowGrid>
}
