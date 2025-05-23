import { router } from 'expo-router'

// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

let routes = {
    root: '/',
    admin: {
        dashboard: '/page/auth/admin/dashboard',
        jobList: '/page/auth/admin/job/job-list',
        jobRunner: '/page/auth/admin/job/job-runner',
        shelfEdit: '/page/auth/admin/shelf/shelf-edit',
        shelfList: '/page/auth/admin/shelf/shelf-list',
        streamSourceEdit: '/page/auth/admin/stream-source/stream-source-edit',
        streamSourceList: '/page/auth/admin/stream-source/stream-source-list',
        tagEdit: '/page/auth/admin/tag/tag-edit',
        tagList: '/page/auth/admin/tag/tag-list',
        userAccess: '/page/auth/admin/user/user-access',
        userEdit: '/page/auth/admin/user/user-edit',
        userList: '/page/auth/admin/user/user-list',
    },
    continueWatching: '/page/auth/list/continue-watching',
    episodeDetails: '/page/auth/details/episode',
    episodeList: '/page/auth/list/episode',
    landing: '/page/auth/landing',
    movieDetails: '/page/auth/details/movie',
    movieList: '/page/auth/list/movie',
    options: '/page/auth/options',
    playMedia: '/page/auth/media/play',
    playlistDetails: '/page/auth/details/playlist',
    playlistList: '/page/auth/list/playlist',
    seasonList: '/page/auth/list/season',
    search: '/page/auth/search',
    showList: '/page/auth/list/show',
    signIn: '/page/sign-in',
    signOut: '/page/auth/sign-out',
    streamSourceDetails: '/page/auth/details/stream-source',
    replace: (target, params) => {
        if (!params) {
            return router.replace(target)
        }
        router.replace({ pathname: target, params })
    },
    goto: (target, params) => {
        if (!params) {
            return router.push(target)
        }
        router.push({ pathname: target, params })
    },
}

routes.func = (target, params) => {
    return () => {
        routes.goto(target, params)
    }
}

routes.back = () => {
    router.back()
}

routes.funcBack = () => {
    return () => {
        routes.back()
    }
}

routes.reset = () => {
    if (router.canDismiss()) {
        router.dismissAll()
    }
    router.replace(routes.root);
}

module.exports = routes
