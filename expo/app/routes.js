import { router } from 'expo-router'

// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

let routes = {
    admin: {
        dashboard: '/page/auth/admin/dashboard',
        userList: '/page/auth/admin/user/user-list',
        userEdit: '/page/auth/admin/user/user-edit',
        userAccess: '/page/auth/admin/user/user-access',
        shelfList: '/page/auth/admin/shelf/shelf-list',
        shelfEdit: '/page/auth/admin/shelf/shelf-edit',
        streamSourceList: '/page/auth/admin/stream-source/stream-source-list',
        streamSourceEdit: '/page/auth/admin/stream-source/stream-source-edit'
    },
    root: '/',
    options: '/page/auth/options',
    landing: '/page/auth/landing',
    signIn: '/page/sign-in',
    signOut: '/page/auth/sign-out',
    movieList: '/page/auth/list/movie',
    movieDetails: '/page/auth/details/movie',
    showList: '/page/auth/list/show',
    seasonList: '/page/auth/list/season',
    episodeList: '/page/auth/list/episode',
    episodeDetails: '/page/auth/details/episode',
    playMedia: '/page/auth/media/play',
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

module.exports = routes
