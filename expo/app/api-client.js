import axios from 'axios'
import config from './settings'
import DeviceInfo from 'react-native-device-info';
import { UAParser } from 'ua-parser-js'
import { Platform } from 'react-native'

export class ApiClient {
    constructor(authToken, isAdmin, onApiError, onLogout) {
        this.authToken = authToken
        this.hasAdmin = isAdmin === 'true'
        this.baseURL = config.webApiUrl + '/api'
        this.onApiError = onApiError
        this.apiErrorSent = false
        let self = this

        this.createClient(self.authToken)

        this.handleError = (err) => {
            console.log(err)
            if (err) {
                if (err.response && err.response.status === 401) {
                    onLogout()
                }
                if (err.code && err.code === 'ERR_NETWORK') {
                    if (!self.apiErrorSent) {
                        self.onApiError(err)
                    }
                    self.apiErrorSent = true
                }
            }
        }

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
                    this.handleError(err)
                })
        }

        this.post = async (url, payload) => {
            return this.httpClient
                .post(url, payload)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    this.handleError(err)
                })
        }

        this.delete = async (url) => {
            return this.httpClient
                .delete(url)
                .then((response) => {
                    return response.data
                })
                .catch((err) => {
                    this.handleError(err)
                })
        }
    }

    createClient(authToken) {
        this.baseURL = config.webApiUrl + '/api'
        this.httpClient = axios.create({
            baseURL: this.baseURL,
        })

        this.authToken = authToken

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
        return new Promise(resolve => {
            let getDeviceId = () => {
                return DeviceInfo.getUniqueId().then((uniqueId) => {
                    const deviceBrand = DeviceInfo.getBrand()
                    return DeviceInfo.getHost().then(deviceName => {
                        return `${deviceBrand} - ${deviceName} - ${uniqueId}`
                    })
                })
            }
            if (Platform.OS === 'web') {
                getDeviceId = () => {
                    return new Promise(resolve => {
                        const uaParser = new UAParser()
                        const result = uaParser.getResult()
                        const deviceId = `${result.os}${result.version ? ' ' + result.version : ''} ${result.browser.name} ${result.browser.major}`
                        return resolve(deviceId)
                    })
                }
            }
            getDeviceId().then((deviceId) => {
                return self.httpClient
                    .postForm('/login', {
                        username: payload.username,
                        password: payload.password,
                        device_info: deviceId
                    })
                    .then((data) => {
                        if (data && data.data && data.data.access_token) {
                            self.authToken = data.data.access_token
                            self.permissions = data.data.permissions
                            self.hasAdmin = self.permissions.includes('admin')
                            self.createClient(self.authToken)
                            self.displayName = data.data.display_name
                        }
                        return resolve({ authToken: self.authToken, isAdmin: self.hasAdmin, displayName: self.displayName })
                    })
            })
        })
    }

    heartbeat() {
        return this.get('/heartbeat')
    }

    createScopedJob(name, details) {
        let payload = { name }
        if (details) {
            if (details.targetKind && details.targetId) {
                payload.input = {
                    target_kind: details.targetKind,
                    target_id: details.targetId
                }
            }
            if (details.metadataId) {
                payload.input.metadata_id = details.metadataId
            }
            if (details.seasonOrder) {
                payload.input.season_order = details.seasonOrder
            }
            if (details.episodeOrder) {
                payload.input.episode_order = details.episodeOrder
            }
            if (details.updateMetadata) {
                payload.input.update_metadata = details.updateMetadata
            }
            if (details.updateImages) {
                payload.input.update_images = details.updateImages
            }
        }
        return this.post('/job', payload)
    }

    createJobStreamSourcesRefresh(details) {
        return this.createScopedJob('stream_sources_refresh', details)
    }

    createJobShelvesScan(details) {
        return this.createScopedJob('scan_shelves_content', details)
    }

    createJobReadMediaFiles(details) {
        return this.createScopedJob('read_media_files', details)
    }

    createJobUpdateMediaFiles(details) {
        return this.createScopedJob('update_media_files', details)
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
            local_path: payload.localPath,
            network_path: payload.networkPath,
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

    getMovieList(shelfId, watchedStatus) {
        return this.get('/movie/list', { shelf_id: shelfId, watched_status: watchedStatus })
    }

    getMovie(movieId) {
        return this.get('/movie', { movie_id: movieId })
    }

    getShowList(shelfId, watchedStatus) {
        return this.get('/show/list', { shelf_id: shelfId, watched_status: watchedStatus })
    }

    getSeasonList(showId, watchedStatus) {
        return this.get('/show/season/list', { show_id: showId, watched_status: watchedStatus })
    }

    getEpisodeList(seasonId, watchedStatus) {
        return this.get('/show/season/episode/list', { show_season_id: seasonId, watched_status: watchedStatus })
    }

    getEpisode(episodeId) {
        return this.get('/show/season/episode', { episode_id: episodeId })
    }

    getUserList() {
        return this.get('/user/list')
    }

    getUser(userId, includeAccess) {
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

    createVideoFileTranscodeSession(videoFileId, audioTrackIndex, subtitleTrackIndex) {
        let requestUrl = `${this.baseURL}/transcode/session?video_file_id=${videoFileId}`
        requestUrl += `&audio_track_index=${audioTrackIndex}`
        requestUrl += `&subtitle_track_index=${subtitleTrackIndex}`
        return this.post(requestUrl)
    }

    createStreamableTranscodeSession(streamableId) {
        return this.post(`${this.baseURL}/transcode/session?streamable_id=${streamableId}`)
    }

    setShelfWatchStatus(shelfId, watched) {
        return this.post('/watch/status', { shelf_id: shelfId, status: watched })
    }

    toggleMovieShelfWatchStatus(shelfId) {
        return this.post(`/shelf/watched/toggle?movie_shelf_id=${shelfId}`)
    }

    toggleShowShelfWatchStatus(shelfId) {
        return this.post(`/shelf/watched/toggle?show_shelf_id = ${shelfId}`)
    }

    toggleMovieWatchStatus(movieId) {
        return this.post(`/movie/watched/toggle?movie_id=${movieId}`)
    }

    toggleShowWatchStatus(showId) {
        return this.post(`/show/watched/toggle?show_id=${showId}`)
    }

    toggleSeasonWatchStatus(seasonId) {
        return this.post(`/show/season/watched/toggle?season_id=${seasonId}`)
    }

    toggleEpisodeWatchStatus(episodeId) {
        return this.post(`/show/season/episode/watched/toggle?episode_id=${episodeId}`)
    }

    setEpisodeWatchProgress(episodeId, playedSeconds, durationSeconds) {
        return this.post(`/show/season/episode/progress`, {
            show_episode_id: episodeId,
            played_seconds: playedSeconds,
            duration_seconds: durationSeconds
        })
    }

    setMovieWatchProgress(movieId, playedSeconds, durationSeconds) {
        return this.post(`/movie/progress`, {
            movie_id: movieId,
            played_seconds: playedSeconds,
            duration_seconds: durationSeconds
        })
    }

    getContinueWatchingList() {
        return this.get('/continue/watching')
    }

    search(query) {
        return this.get('/search', { query })
    }

    getPlaylistList() {
        return this.get('/playlist/list')
    }

    getPlaylist(tagId) {
        return this.get('/playlist', { tag_id: tagId })
    }

    getPlayingQueue(details) {
        if (details.showId) {
            return this.get(`/playing/queue?show_id=${details.showId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.seasonId) {
            return this.get(`/playing/queue?show_season_id=${details.seasonId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.tagId) {
            return this.get(`/playing/queue?tag_id=${details.tagId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.source) {
            return this.get(`/playing/queue?source=${details.source}`)
        }
        else {
            console.log("Unhandled playing queue")
            console.log({ details })
        }
    }

    updatePlayingQueue(source, progress) {
        return this.post(`/playing/queue?source=${source}&progress=${progress}`)
    }

    debug() {
        console.log({ baseURL: this.baseURL, authToken: this.authToken })
    }
}
