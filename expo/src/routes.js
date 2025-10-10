// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

// /wrap/ routes will have the nav header
export var routes = {
    signIn: '/sign-in',
    landing: '/auth/wrap/landing',
    signOut: '/auth/sign-out',
    info: '/auth/wrap/info',

    continueWatching: '/auth/wrap/list/continue-watching',
    episodeDetails: '/auth/wrap/details/episode',
    episodeList: '/auth/wrap/list/episode',
    episodePlay: '/auth/play/episode',
    keepsakeDetails: '/auth/wrap/details/keepsake',
    movieDetails: '/auth/wrap/details/movie',
    movieList: '/auth/wrap/list/movie',
    moviePlay: '/auth/play/movie',
    options: '/auth/wrap/options',
    playingQueuePlay: '/auth/play/playing-queue',
    playlistDetails: '/auth/wrap/details/playlist',
    playlistList: '/auth/wrap/list/playlist',
    search: '/auth/wrap/search',
    seasonList: '/auth/wrap/list/season',
    showList: '/auth/wrap/list/show',
    streamableList: '/auth/wrap/list/streamable',
    streamablePlay: '/auth/play/streamable',

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
    adminUserAccess: '/auth/wrap/admin/user/user-access',
    adminUserEdit: '/auth/wrap/admin/user/user-edit',
    adminUserList: '/auth/wrap/admin/user/user-list',
}

export function QuietReactWarning() {
    return null
}

export default QuietReactWarning