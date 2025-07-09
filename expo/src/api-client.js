import axios from 'axios'
import DeviceInfo from 'react-native-device-info';
import { UAParser } from 'ua-parser-js'
import { Platform } from 'react-native'
import util from './util'

export class ApiClient {
    constructor(details) {
        this.webApiUrl = details.webApiUrl
        this.hasAdmin = details.isAdmin
        this.onApiError = details.onApiError
        this.apiErrorSent = false
        let self = this

        // Only functions that get passed around as higher order functions need to be bound
        this.login = this.login.bind(this)

        // An example of this is the job runner
        this.createScopedJob = this.createScopedJob.bind(this)
        this.createJobStreamSourcesRefresh = this.createJobStreamSourcesRefresh.bind(this)
        this.createJobShelvesScan = this.createJobShelvesScan.bind(this)
        this.createJobReadMediaFiles = this.createJobReadMediaFiles.bind(this)
        this.createJobUpdateMediaFiles = this.createJobUpdateMediaFiles.bind(this)
        this.createJobIdentifyUnknownMedia = this.createJobIdentifyUnknownMedia.bind(this)
        this.createJobCleanFileRecords = this.createJobCleanFileRecords.bind(this)

        // Another example is the watched status setters used by onLongPress event handlers
        this.toggleItemWatched = this.toggleItemWatched.bind(this)
        this.toggleMovieShelfWatchStatus = this.toggleMovieShelfWatchStatus.bind(this)
        this.toggleMovieWatchStatus = this.toggleMovieWatchStatus.bind(this)
        this.toggleShowShelfWatchStatus = this.toggleShowShelfWatchStatus.bind(this)
        this.toggleEpisodeWatchStatus = this.toggleEpisodeWatchStatus.bind(this)
        this.toggleSeasonWatchStatus = this.toggleSeasonWatchStatus.bind(this)
        this.toggleShowWatchStatus = this.toggleShowWatchStatus.bind(this)
        this.setItemWatched = this.setItemWatched.bind(this)
        this.setItemUnwatched = this.setItemUnwatched.bind(this)

        this.createClient(details)

        this.handleError = (err) => {
            util.log(err)
            if (err) {
                if (err.response && err.response.status === 401) {
                    details.onLogout()
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

    createClient(details) {
        this.baseURL = details.webApiUrl + '/api'
        this.authToken = details.authToken

        if (this.authToken) {
            this.httpClient = axios.create({
                baseURL: this.baseURL,
                headers: {
                    Authorization: 'Bearer ' + this.authToken,
                },
            })
        } else {
            this.httpClient = axios.create({
                baseURL: this.baseURL,
            })
        }
    }

    isAuthenticated() {
        return this.authToken !== null
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
                            self.createClient({ webApiUrl: self.webApiUrl, authToken: self.authToken })
                            self.displayName = data.data.display_name
                        }
                        return resolve({
                            authToken: self.authToken,
                            isAdmin: self.hasAdmin,
                            displayName: self.displayName
                        })
                    })
                    .catch((err) => {
                        return resolve({ failed: true, err: err })
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
            payload.input = {}
            if (details.targetKind && details.targetId) {
                payload.input.target_kind = details.targetKind
                payload.input.target_id = details.targetId
            }
            if (details.targetDirectory) {
                payload.input.target_directory = details.targetDirectory
            }
            if (details.metadataId) {
                payload.input.metadata_id = details.metadataId
            }
            if (details.metadataSource) {
                payload.input.metadata_source = details.metadataSource
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
            if (details.updateVideos) {
                payload.input.update_videos = details.updateVideos
            }
            if (details.skipExisting) {
                payload.input.skip_existing = details.skipExisting
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

    createJobIdentifyUnknownMedia(details) {
        return this.createScopedJob('identify_unknown_media', details)
    }

    createJobCleanFileRecords(details) {
        return this.createScopedJob('clean_file_records', details)
    }

    getJobList() {
        return this.get('/job/list')
    }

    getJob(jobId) {
        return this.get(`/job?job_id=${jobId}`)
    }

    getLogPaths() {
        return this.get('/log/list')
    }

    getLog(logIndex) {
        return this.get(`/log?log_index=${logIndex}`)
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

    getMovieList(shelfId, showPlaylisted) {
        return this.get('/movie/list', { shelf_id: shelfId, show_playlisted: showPlaylisted })
    }

    getMovie(movieId) {
        return this.get('/movie', { movie_id: movieId })
    }

    getShowList(shelfId, showPlaylisted) {
        return this.get('/show/list', { shelf_id: shelfId, show_playlisted: showPlaylisted })
    }

    getSeasonList(showId) {
        return this.get('/show/season/list', { show_id: showId })
    }

    getEpisodeList(shelfId, seasonId) {
        return this.get('/show/season/episode/list', { shelf_id: shelfId, show_season_id: seasonId })
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

    saveUser(details) {
        let payload = {
            id: details.id,
            username: details.username,
            display_name: details.displayName,
            enabled: details.enabled,
            permissions: details.permissions,
        }
        if (details.rawPassword) {
            payload.raw_password = details.rawPassword
            payload.set_password = details.setPassword
        }
        return this.post('/user', payload)
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
        return this.post(`/shelf/watched/toggle?show_shelf_id=${shelfId}`)
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

    setMovieWatchProgress(movieId, playedSeconds, durationSeconds
    ) {
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
            return this.get(`/playing/queue?shelf_id=${details.shelfId}&show_id=${details.showId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.seasonId) {
            return this.get(`/playing/queue?shelf_id=${details.shelfId}&show_season_id=${details.seasonId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.tagId) {
            return this.get(`/playing/queue?tag_id=${details.tagId}&shuffle=${!!details.shuffle}`)
        }
        else if (details.source) {
            return this.get(`/playing/queue?source=${details.source}`)
        }
        else {
            util.log("Unhandled playing queue")
            util.log({ details })
        }
    }

    updatePlayingQueue(source, progress) {
        return this.post(`/playing/queue?source=${source}&progress=${progress}`)
    }

    increaseShowEpisodeWatchCount(episodeId) {
        return this.post(`/show/season/episode/watch_count?show_episode_id=${episodeId}`)
    }

    increaseMovieWatchCount(movieId) {
        return this.post(`/movie/watch_count?movie_id=${movieId}`)
    }

    getKeepsakeList(shelfId) {
        return this.get(`/keepsake/list?shelf_id=${shelfId}`)
    }

    getKeepsake(keepsakeId) {
        return this.get(`/keepsake?keepsake_id=${keepsakeId}`)
    }

    getSessionList() {
        return this.get('/session/list')
    }

    toggleItemWatched(item) {
        if (item.model_kind === 'movie') {
            return this.toggleMovieWatchStatus(item.id)
        }
        else if (item.model_kind === 'show') {
            return this.toggleShowWatchStatus(item.id)
        }
        else if (item.model_kind === 'show_season') {
            return this.toggleSeasonWatchStatus(item.id)
        }
        else if (item.model_kind === 'show_episode') {
            return this.toggleEpisodeWatchStatus(item.id)
        }
    }

    setItemWatchedStatus(item, isWatched) {
        if (item.model_kind === 'movie') {
            return this.post(`/movie/watched?movie_id=${item.id}&is_watched=${isWatched}`)
        }
        else if (item.model_kind === 'show') {
            return this.post(`/show/watched?show_id=${item.id}&is_watched=${isWatched}`)
        }
        else if (item.model_kind === 'show_season') {
            return this.post(`/show/season/watched?season_id=${item.id}&is_watched=${isWatched}`)
        }
        else if (item.model_kind === 'show_episode') {
            return this.post(`/show/season/episode/watched?episode_id=${item.id}&is_watched=${isWatched}`)
        }
    }

    setItemWatched(item) {
        return this.setItemWatchedStatus(item, true)
    }

    setItemUnwatched(item) {
        return this.setItemWatchedStatus(item, false)
    }

    debug() {
        util.log({ baseURL: this.baseURL, authToken: this.authToken })
    }
}

export default ApiClient