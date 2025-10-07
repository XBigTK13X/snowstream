import util from './util'
import { router } from 'expo-router'

// DOCS router method https://docs.expo.dev/router/navigating-pages/#imperative-navigation

export var routes = {
    info: '/info',
    signIn: '/',
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
    },
    continueWatching: '/auth/wrap/list/continue-watching',
    episodeDetails: '/auth/wrap/details/episode',
    episodeList: '/auth/wrap/list/episode',
    episodePlay: '/auth/play/episode',
    keepsakeDetails: '/auth/wrap/details/keepsake',
    landing: '/auth/wrap/landing',
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
    signOut: '/auth/sign-out',
    streamableList: '/auth/wrap/list/streamable',
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
    console.log("Going back")
    try {
        router.back()
    }
    catch {
        routes.goto(routes.landing)
    }
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