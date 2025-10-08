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

    admin: {
        dashboard: '/auth/wrap/admin/dashboard',
        cleanupRuleEdit: '/auth/wrap/admin/cleanup-rule/cleanup-rule-edit',
        cleanupRuleList: '/auth/wrap/admin/cleanup-rule/cleanup-rule-list',
        channelsEdit: '/auth/wrap/admin/guide-source/channels-edit',
        channelGuideSourceList: '/auth/wrap/admin/guide-source/guide-source-list',
        channelGuideSourceEdit: '/auth/wrap/admin/guide-source/guide-source-edit',
        jobDetails: '/auth/wrap/admin/job/job-details',
        jobList: '/auth/wrap/admin/job/job-list',
        jobRunner: '/auth/wrap/admin/job/job-runner',
        logViewer: '/auth/wrap/admin/job/log-viewer',
        sessionList: '/auth/wrap/admin/session/session-list',
        shelfEdit: '/auth/wrap/admin/shelf/shelf-edit',
        shelfList: '/auth/wrap/admin/shelf/shelf-list',
        streamablesEdit: '/auth/wrap/admin/stream-source/streamables-edit',
        streamSourceEdit: '/auth/wrap/admin/stream-source/stream-source-edit',
        streamSourceList: '/auth/wrap/admin/stream-source/stream-source-list',
        tagEdit: '/auth/wrap/admin/tag/tag-edit',
        tagList: '/auth/wrap/admin/tag/tag-list',
        userAccess: '/auth/wrap/admin/user/user-access',
        userEdit: '/auth/wrap/admin/user/user-edit',
        userList: '/auth/wrap/admin/user/user-list',
    }
}

export function QuietReactWarning() {
    return null
}

export default QuietReactWarning