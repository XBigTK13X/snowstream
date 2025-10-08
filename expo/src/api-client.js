import axios from 'axios'
import util from './util'

const JOB_PROPERTIES = [
    ['targetKind', 'target_kind'],
    ['targetId', 'target_id'],
    ['targetDirectory', 'target_directory'],
    ['metadataId', 'metadata_id'],
    ['metadataSource', 'metadata_source'],
    ['seasonOrder', 'season_order'],
    ['episodeOrder', 'episode_order'],
    ['updateMetadata', 'update_metadata'],
    ['updateImages', 'update_images'],
    ['updateVideos', 'update_videos'],
    ['skipExisting', 'skip_existing'],
    ['extractOnly', 'extract_only'],
]

export class ApiClient {
    constructor(details) {
        this.webApiUrl = details.webApiUrl
        this.hasAdmin = details.isAdmin
        this.onApiError = details.onApiError
        this.apiErrorSent = false
        let self = this
        this.createClient(details)

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

        // Only functions that get passed around as higher order functions need to be bound
        this.login = this.login.bind(this)

        // An example of this is the job runner
        this.closeAllTranscodeSessions = this.closeAllTranscodeSessions.bind(this)
        this.createJobCleanFileRecords = this.createJobCleanFileRecords.bind(this)
        this.createJobDeleteMediaRecords = this.createJobDeleteMediaRecords.bind(this)
        this.createJobIdentifyUnknownMedia = this.createJobIdentifyUnknownMedia.bind(this)
        this.createJobReadMediaFiles = this.createJobReadMediaFiles.bind(this)
        this.createJobSanitizeFileProperties = this.createJobSanitizeFileProperties.bind(this)
        this.createJobShelvesScan = this.createJobShelvesScan.bind(this)
        this.createJobChannelGuideRefresh = this.createJobChannelGuideRefresh.bind(this)
        this.createJobStreamSourcesRefresh = this.createJobStreamSourcesRefresh.bind(this)
        this.createJobUpdateMediaFiles = this.createJobUpdateMediaFiles.bind(this)
        this.createScopedJob = this.createScopedJob.bind(this)
        this.deleteAllCachedText = this.deleteAllCachedText.bind(this)

        // Another example is the watched status setters used by onLongPress event handlers
        this.toggleItemWatched = this.toggleItemWatched.bind(this)
        this.setItemUnwatched = this.setItemUnwatched.bind(this)
        this.setItemWatched = this.setItemWatched.bind(this)
        this.toggleEpisodeWatchStatus = this.toggleEpisodeWatchStatus.bind(this)
        this.toggleMovieShelfWatchStatus = this.toggleMovieShelfWatchStatus.bind(this)
        this.toggleMovieWatchStatus = this.toggleMovieWatchStatus.bind(this)
        this.toggleSeasonWatchStatus = this.toggleSeasonWatchStatus.bind(this)
        this.toggleShowShelfWatchStatus = this.toggleShowShelfWatchStatus.bind(this)
        this.toggleShowWatchStatus = this.toggleShowWatchStatus.bind(this)

        this.createVideoFileTranscodeSession = this.createVideoFileTranscodeSession.bind(this)
        this.createStreamableTranscodeSession = this.createStreamableTranscodeSession.bind(this)

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
            return self.httpClient
                .postForm('/login', {
                    username: payload.username,
                    password: payload.password,
                    device_name: payload.deviceId,
                    device_profile: payload.deviceProfile
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
    }

    heartbeat() {
        return this.get('/heartbeat')
    }

    createScopedJob(name, details) {
        let payload = { name }
        if (details) {
            payload.input = {}
            for (const prop of JOB_PROPERTIES) {
                if (details.hasOwnProperty(prop[0])) {
                    payload.input[prop[1]] = details[prop[0]]
                }
            }
        }
        return this.post('/job', payload)
    }

    createJobStreamSourcesRefresh(details) {
        return this.createScopedJob('stream_sources_refresh', details)
    }

    createJobChannelGuideRefresh(details) {
        return this.createScopedJob('channel_guide_refresh', details)
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

    createJobDeleteMediaRecords(details) {
        return this.createScopedJob('delete_media_records', details)
    }

    createJobSanitizeFileProperties(details) {
        return this.createScopedJob('sanitize_file_properties', details)
    }

    getJobList(showComplete, limit) {
        let query = `/job/list?show_complete=${showComplete}`
        if (limit) {
            query += `&limit=${limit}`
        }
        return this.get(query)
    }

    getJob(jobId) {
        return this.get(`/job?job_id=${jobId}`)
    }

    getLogPaths() {
        return this.get('/log/list')
    }

    getLog(logIndex, logPath) {
        if (logIndex !== undefined && logIndex !== null) {
            return this.get(`/log?log_index=${logIndex}`)
        }
        return this.get(`/log?transcode_log_path=${logPath}`)
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
        return this.get(`/stream/source/list`)
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

    saveStreamable(payload) {
        return this.post('/streamable', {
            id: payload.id,
            name_display: payload.nameDisplay,
            group_display: payload.groupDisplay
        })
    }

    getChannelGuideSourceList() {
        return this.get('/channel/guide/source/list')
    }

    getChannelGuideSource(guideSourceId) {
        return this.get(`/channel/guide/source?channel_guide_source_id=${guideSourceId}`)
    }

    saveChannelGuideSource(payload) {
        return this.post('/channel/guide/source', {
            id: payload.id,
            name: payload.name,
            kind: payload.kind,
            url: payload.url,
            username: payload.username,
            password: payload.password
        })
    }

    saveChannel(payload) {
        if (payload.editedNumber === '') {
            payload.editedNumber = null
        }
        return this.post('/channel', {
            id: payload.id,
            edited_name: payload.editedName,
            edited_number: payload.editedNumber,
            edited_id: payload.editedId,
            streamable_id: payload.streamableId
        })
    }

    deleteChannelGuideSource(channel_guide_source_id) {
        return this.delete(`/channel/guide/source/${channel_guide_source_id}`)
    }

    getStreamable(streamableId) {
        return this.get('/streamable', { streamable_id: streamableId })
    }

    getStreamableList() {
        return this.get('/streamable/list')
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

    getMovie(movieId, deviceProfile) {
        return this.get(`/movie?movie_id=${movieId}&device_profile=${deviceProfile}`)
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

    getEpisode(episodeId, deviceProfile) {
        return this.get(`/show/season/episode?episode_id=${episodeId}&device_profile=${deviceProfile}`)
    }

    getUserList(deviceProfile) {
        return this.get(`/user/list?device_profile=${deviceProfile}`)
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

    getDeviceProfileList() {
        return this.get('/device/profile/list')
    }

    createVideoFileTranscodeSession(videoFileId, audioTrackIndex, subtitleTrackIndex, deviceProfile, seekToSeconds) {
        let requestUrl = `/transcode/session?video_file_id=${videoFileId}&device_profile=${deviceProfile}`
        if (audioTrackIndex !== -1) {
            requestUrl += `&audio_track_index=${audioTrackIndex}`
        }
        if (subtitleTrackIndex !== -1) {
            requestUrl += `&subtitle_track_index=${subtitleTrackIndex}`
        }
        if (seekToSeconds) {
            requestUrl += `&seek_to_seconds=${Math.floor(seekToSeconds)}`
        }
        return this.post(requestUrl)
    }

    createStreamableTranscodeSession(streamableId, deviceProfile, seekToSeconds) {
        let requestUrl = `/transcode/session?streamable_id=${streamableId}&device_profile=${deviceProfile}`
        if (seekToSeconds) {
            requestUrl += `&seek_to_seconds=${Math.floor(seekToSeconds)}`
        }
        return this.post(requestUrl)
    }

    closeTranscodeSession(transcodeId) {
        return this.delete(`/transcode/session?transcode_session_id=${transcodeId}`)
    }

    closeAllTranscodeSessions(transcodeId) {
        return this.delete(`/transcode/session`)
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

    getKeepsake(shelfId, subdirectory64) {
        let url = `/keepsake?shelf_id=${shelfId}`
        if (subdirectory64) {
            url += `&subdirectory64=${subdirectory64}`
        }
        return this.get(url)
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

    savePlaybackLogs(logs) {
        return this.post('/log/playback', { logs })
    }

    deleteAllCachedText() {
        return this.delete('/cached/text')
    }

    getDisplayCleanupRuleList() {
        return this.get('/display-cleanup-rule/list')
    }

    getDisplayCleanupRule(ruleId) {
        return this.get(`/display-cleanup-rule?rule_id=${ruleId}`)
    }

    saveDisplayCleanupRule(rule) {
        return this.post('/display-cleanup-rule', {
            id: rule.id,
            rule_kind: rule.ruleKind,
            target_kind: rule.targetKind,
            priority: rule.priority !== '' ? parseInt(rule.priority, 10) : null,
            needle: rule.needle,
            replacement: rule.replacement
        })
    }

    deleteDisplayCleanupRule(ruleId) {
        return this.delete(`/display-cleanup-rule?rule_id=${ruleId}`)
    }

    debug() {
        util.log({ baseURL: this.baseURL, authToken: this.authToken })
    }
}

export default ApiClient