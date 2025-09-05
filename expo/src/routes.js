import util from './util'
import { router } from 'expo-router'

// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

export var routes = {
    admin: {
        dashboard: '/auth/admin/dashboard',
        cleanupRuleEdit: '/auth/admin/cleanup-rule/cleanup-rule-edit',
        cleanupRuleList: '/auth/admin/cleanup-rule/cleanup-rule-list',
        jobDetails: '/auth/admin/job/job-details',
        jobList: '/auth/admin/job/job-list',
        jobRunner: '/auth/admin/job/job-runner',
        logViewer: '/auth/admin/job/log-viewer',
        sessionList: '/auth/admin/session/session-list',
        shelfEdit: '/auth/admin/shelf/shelf-edit',
        shelfList: '/auth/admin/shelf/shelf-list',
        streamSourceEdit: '/auth/admin/stream-source/stream-source-edit',
        streamSourceList: '/auth/admin/stream-source/stream-source-list',
        tagEdit: '/auth/admin/tag/tag-edit',
        tagList: '/auth/admin/tag/tag-list',
        userAccess: '/auth/admin/user/user-access',
        userEdit: '/auth/admin/user/user-edit',
        userList: '/auth/admin/user/user-list',
    },
    continueWatching: '/auth/list/continue-watching',
    episodeDetails: '/auth/details/episode',
    episodeList: '/auth/list/episode',
    episodePlay: '/auth/play/episode',
    info: '/info',
    keepsakeDetails: '/auth/details/keepsake',
    keepsakeList: '/auth/list/keepsake',
    landing: '/auth/landing',
    movieDetails: '/auth/details/movie',
    movieList: '/auth/list/movie',
    moviePlay: '/auth/play/movie',
    options: '/auth/options',
    playingQueuePlay: '/auth/play/playing-queue',
    playlistDetails: '/auth/details/playlist',
    playlistList: '/auth/list/playlist',
    search: '/auth/search',
    seasonList: '/auth/list/season',
    showList: '/auth/list/show',
    signIn: '/',
    signOut: '/auth/sign-out',
    streamableList: '/auth/list/streamable',
    streamablePlay: '/auth/play/streamable',
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
    router.replace(routes.signIn);
}

routes.gotoItem = (item) => {
    if (item.model_kind === 'movie') {
        routes.goto(routes.movieDetails, {
            shelfId: item.shelf.id,
            movieId: item.id
        })
    }
    else if (item.model_kind === 'show') {
        routes.goto(routes.seasonList, {
            shelfId: item.shelf.id,
            showId: item.id,
            showName: item.name
        })
    }
    else if (item.model_kind === 'show_season') {
        routes.goto(routes.episodeList, {
            shelfId: item.show.shelf.id,
            showId: item.show.id,
            seasonId: item.id,
            showName: item.show.name,
            seasonOrder: item.season_order_counter,
        })
    }
    else if (item.model_kind === 'show_episode') {
        routes.goto(routes.episodeDetails, {
            shelfId: item.season.show.shelf.id,
            showId: item.season.show.id,
            seasonId: item.season.id,
            episodeId: item.id,
            showName: item.season.show.name,
            seasonOrder: item.season.season_order_counter,
            episodeOrder: item.episode_order_counter
        })
    }
    else if (item.model_kind === 'playlist') {
        routes.goto(routes.playlistDetails, {
            tagId: item.id,
            tagName: item.name
        })
    }
    else {
        util.log("Unhandled poster item")
        util.log({ item })
    }
}

export function QuietReactWarning() {
    return null
}

export default QuietReactWarning