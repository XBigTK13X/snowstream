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

    getStreamSources() {
        return this.get('/stream/source/list')
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

    getStreamSources() {
        return this.get('/stream/source/list')
    }

    getStreamSource(streamSourceId) {
        return this.get('/stream/source', { stream_source_id: streamSourceId })
    }

    getStreamable(streamableId) {
        return this.get('/streamable', { streamable_id: streamableId })
    }

    saveShelf(payload) {
        console.log({ payload })
        return this.post('/shelf', {
            name: payload.name,
            kind: payload.kind,
            directory: payload.directory,
            id: payload.id
        })
    }

    getShelves() {
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

    getUsers() {
        return this.get('/user/list')
    }

    debug() {
        console.log({ baseURL: this.baseURL, authToken: this.authToken })
    }
}
