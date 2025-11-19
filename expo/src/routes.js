// /wrap/ routes will have the nav header
export var routes = {
    signIn: '/sign-in',
    landing: '/auth/wrap/landing',
    info: '/auth/wrap/info',

    episodePlay: '/auth/play/episode',
    keepsakePlay: '/auth/play/keepsake',
    moviePlay: '/auth/play/movie',
    playingQueuePlay: '/auth/play/playing-queue',
    streamablePlay: '/auth/play/streamable',

    continueWatching: '/auth/wrap/list/continue-watching',
    episodeDetails: '/auth/wrap/details/episode',
    episodeList: '/auth/wrap/list/episode',
    keepsakeDetails: '/auth/wrap/details/keepsake',
    movieDetails: '/auth/wrap/details/movie',
    movieList: '/auth/wrap/list/movie',
    options: '/auth/wrap/options',
    playlistDetails: '/auth/wrap/details/playlist',
    playlistList: '/auth/wrap/list/playlist',
    search: '/auth/wrap/search',
    seasonList: '/auth/wrap/list/season',
    showList: '/auth/wrap/list/show',
    streamableList: '/auth/wrap/list/streamable',

    adminDashboard: '/auth/wrap/admin/dashboard',
    adminCleanupRuleEdit: '/auth/wrap/admin/cleanup-rule/cleanup-rule-edit',
    adminCleanupRuleList: '/auth/wrap/admin/cleanup-rule/cleanup-rule-list',
    adminChannelsEdit: '/auth/wrap/admin/guide-source/channels-edit',
    adminChannelGuideSourceList: '/auth/wrap/admin/guide-source/guide-source-list',
    adminChannelGuideSourceEdit: '/auth/wrap/admin/guide-source/guide-source-edit',
    adminJobDetails: '/auth/wrap/admin/job/job-details',
    adminJobList: '/auth/wrap/admin/job/job-list',
    adminJobRunner: '/auth/wrap/admin/job/job-runner',
    adminLogViewer: '/auth/wrap/admin/job/log-viewer',
    adminSessionList: '/auth/wrap/admin/session/session-list',
    adminShelfEdit: '/auth/wrap/admin/shelf/shelf-edit',
    adminShelfList: '/auth/wrap/admin/shelf/shelf-list',
    adminStreamablesEdit: '/auth/wrap/admin/stream-source/streamables-edit',
    adminStreamSourceEdit: '/auth/wrap/admin/stream-source/stream-source-edit',
    adminStreamSourceList: '/auth/wrap/admin/stream-source/stream-source-list',
    adminTagEdit: '/auth/wrap/admin/tag/tag-edit',
    adminTagList: '/auth/wrap/admin/tag/tag-list',
    adminTagRuleEdit: '/auth/wrap/admin/tag-rule/tag-rule-edit',
    adminTagRuleList: '/auth/wrap/admin/tag-rule/tag-rule-list',
    adminUserAccess: '/auth/wrap/admin/user/user-access',
    adminUserEdit: '/auth/wrap/admin/user/user-edit',
    adminUserList: '/auth/wrap/admin/user/user-list',
}

export function QuietReactWarning() {
    return null
}

export default QuietReactWarning