import axios from 'axios'
import config from './settings'

export class ApiClient {
    constructor(authToken, isAdmin) {
        this.authToken = authToken
        this.hasAdmin = isAdmin === 'true'

        this.createClient(this.authToken)

        this.get = async (url, params) => {
            let queryParams = null
            if (params) {
                queryParams = { params: params }
            }
            return this.httpClient
                .get(url, queryParams)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    //TODO Better central management off critical errors
                    if (err && err.response && err.response.status === 401) {
                        //localStorage.removeItem("snowstream-auth-token");
                        this.authToken = null
                    }
                })
        }

        this.post = async (url, payload) => {
            return this.httpClient
                .post(url, payload)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    //TODO Better central management off critical errors
                    if (err && err.response && err.response.status === 401) {
                        //localStorage.removeItem("snowstream-auth-token");
                        this.authToken = null
                    }
                })
        }

        this.delete = async (url) => {
            return this.httpClient
                .delete(url)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    //TODO Better central management off critical errors
                    if (err && err.response && err.response.status === 401) {
                        //localStorage.removeItem("snowstream-auth-token");
                        this.authToken = null
                    }
                })
        }
    }

    createClient(authToken) {
        this.baseURL = config.webApiUrl + '/api'
        this.httpClient = axios.create({
            baseURL: this.baseURL,
        })

        this.authToken = authToken //localStorage.getItem("snowstream-auth-token");

        if (this.authToken) {
            this.httpClient = axios.create({
                baseURL: this.baseURL,
                headers: {
                    Authorization: 'Bearer ' + this.authToken,
                },
            })
        }
    }

    isAuthenticated() {
        return this.authToken !== null
    }

    isAdmin() {
        return this.hasAdmin
    }

    login(payload) {
        let self = this
        return self.httpClient
            .postForm('/login', {
                username: payload.username,
                password: payload.password,
            })
            .then((data) => {
                if (data && data.data && data.data.access_token) {
                    self.authToken = data.data.access_token
                    self.permissions = data.data.permissions
                    console.log({ perms: self.permissions })
                    self.hasAdmin = self.permissions.includes('admin')
                    //localStorage.setItem("snowstream-auth-token", this.authToken);
                    self.createClient(self.authToken)
                }
                return { authToken: self.authToken, isAdmin: self.hasAdmin }
            })
    }

    logout() {
        //localStorage.removeItem("snowstream-auth-token");
        this.authToken = null
    }

    scheduleStreamSourcesRefresh() {
        return this.post('/job', { name: 'stream_sources_refresh' })
    }

    createStreamSource(payload) {
        return this.post('/stream/source', {
            url: payload.url,
            username: payload.username,
            password: payload.password,
            kind: payload.kind,
            name: payload.name,
        })
    }

    scheduleShelvesScan() {
        return this.post('/job', { name: 'scan_shelves_content' })
    }

    getStreamSourceList() {
        return this.get('/stream/source/list')
    }

    getStreamSource(streamSourceId) {
        return this.get('/stream/source', { stream_source_id: streamSourceId })
    }

    saveStreamSource(payload) {
        return this.post('/stream/source', {
            id: payload.id,
            name: payload.name,
            kind: payload.kind,
            url: payload.url,
            username: payload.username,
            password: payload.password
        })
    }

    deleteStreamSource(stream_source_id) {
        return this.delete(`/stream/source/${stream_source_id}`)
    }

    getStreamable(streamableId) {
        return this.get('/streamable', { streamable_id: streamableId })
    }

    saveShelf(payload) {
        return this.post('/shelf', {
            name: payload.name,
            kind: payload.kind,
            directory: payload.directory,
            id: payload.id
        })
    }

    deleteShelf(shelfId) {
        return this.delete(`/shelf/${shelfId}`)
    }

    getShelfList() {
        return this.get('/shelf/list')
    }

    getShelf(shelfId) {
        return this.get('/shelf', { shelf_id: shelfId })
    }

    getMovieList(shelfId) {
        return this.get('/movie/list', { shelf_id: shelfId })
    }

    getMovie(movieId) {
        return this.get('/movie', { movie_id: movieId })
    }

    getShowList(shelfId) {
        return this.get('/show/list', { shelf_id: shelfId })
    }

    getSeasonList(showId) {
        return this.get('/show/season/list', { show_id: showId })
    }

    getEpisodeList(seasonId) {
        return this.get('/show/season/episode/list', { show_season_id: seasonId })
    }

    getEpisode(episodeId) {
        return this.get('/show/season/episode', { episode_id: episodeId })
    }

    getUserList() {
        return this.get('/user/list')
    }

    getUser(userId) {
        return this.get('/user', { user_id: userId })
    }

    saveUser(payload) {
        return this.post('/user', {
            id: payload.id,
            username: payload.username,
            display_name: payload.displayName,
            enabled: payload.enabled,
            permissions: payload.permissions
        })
    }

    deleteUser(userId) {
        return this.delete(`/user/${userId}`)
    }

    getUserAccess(userId) {
        return this.get('/user/access', { user_id: userId })
    }

    saveUserAccess(payload) {
        return this.post('/user/access', {
            user_id: payload.userId,
            tag_ids: payload.tagIds,
            shelf_ids: payload.shelfIds,
            stream_source_ids: payload.streamSourceIds
        })
    }

    getTag(tagId) {
        return this.get('/tag', { tag_id: tagId })
    }

    getTagList() {
        return this.get('/tag/list')
    }

    saveTag(payload) {
        return this.post('/tag', {
            id: payload.id,
            name: payload.name
        })
    }

    deleteTag(tagId) {
        return this.delete(`/tag/${tagId}`)
    }

    debug() {
        console.log({ baseURL: this.baseURL, authToken: this.authToken })
    }
}
