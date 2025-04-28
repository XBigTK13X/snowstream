import C from '../../../common'

export default function AdminDashboardPage() {
    const { routes } = C.useSettings();
    const renderItem = (item) => {
        return <C.SnowTextButton title={item.title} onPress={routes.func(item.route)} />
    }
    const buttons = [
        { title: 'Shelves', route: routes.admin.shelfList },
        { title: 'Stream Sources', route: routes.admin.streamSourceList },
        { title: 'Users', route: routes.admin.userList },
        { title: 'Tags', route: routes.admin.tagList },
        { title: 'Job List', route: routes.admin.jobList },
        { title: 'Run Job', route: routes.admin.jobRunner },
    ]
    return <C.SnowGrid data={buttons} renderItem={renderItem}></C.SnowGrid>
}
