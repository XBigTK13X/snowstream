import C from '../../../common'

export default function AdminDashboardPage() {
    const { routes } = C.useAppContext();
    const renderItem = (item) => {
        return <C.SnowTextButton title={item.title} onPress={routes.func(item.route)} />
    }
    const actionButtons = [
        { title: 'Run Job', route: routes.admin.jobRunner },
        { title: 'Job List', route: routes.admin.jobList },
        { title: 'Logs', route: routes.admin.logViewer },
        { title: 'Sessions', route: routes.admin.sessionList },
    ]
    const dataButtons = [
        { title: 'Shelves', route: routes.admin.shelfList },
        { title: 'Stream Sources', route: routes.admin.streamSourceList },
        { title: 'Channel Guides', route: routes.admin.channelGuideSourceList },
        { title: 'Users', route: routes.admin.userList },
        { title: 'Tags', route: routes.admin.tagList },
        { title: 'Cleanup Rules', route: routes.admin.cleanupRuleList },
    ]
    return (
        <C.View>
            <C.SnowGrid shouldFocus items={actionButtons} renderItem={renderItem} itemsPerRow={2}></C.SnowGrid>
            <C.SnowBreak />
            <C.SnowGrid items={dataButtons} renderItem={renderItem} itemsPerRow={3}></C.SnowGrid>
        </C.View>

    )
}
