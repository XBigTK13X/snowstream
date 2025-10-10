import { C, useAppContext } from 'snowstream'

export default function AdminDashboardPage() {
    const { routes } = useAppContext();
    const { navPush } = C.useSnowContext()

    const renderItem = (item) => {
        return <C.SnowTextButton title={item.title} onPress={navPush(item.route, true)} />
    }
    const actionButtons = [
        { title: 'Run Job', route: routes.adminJobRunner },
        { title: 'Job List', route: routes.adminJobList },
        { title: 'Logs', route: routes.adminLogViewer },
        { title: 'Sessions', route: routes.adminSessionList },
    ]
    const dataButtons = [
        { title: 'Shelves', route: routes.adminShelfList },
        { title: 'Stream Sources', route: routes.adminStreamSourceList },
        { title: 'Channel Guides', route: routes.adminChannelGuideSourceList },
        { title: 'Users', route: routes.adminUserList },
        { title: 'Tags', route: routes.adminTagList },
        { title: 'Cleanup Rules', route: routes.adminCleanupRuleList },
    ]
    return (
        <C.View>
            <C.SnowGrid
                focusStart
                focusKey="page-entry"
                focusDown="data-buttons"
                items={actionButtons}
                renderItem={renderItem}
                itemsPerRow={2}></C.SnowGrid>
            <C.SnowBreak />
            <C.SnowGrid focusKey="data-buttons" items={dataButtons} renderItem={renderItem} itemsPerRow={3}></C.SnowGrid>
        </C.View>

    )
}
