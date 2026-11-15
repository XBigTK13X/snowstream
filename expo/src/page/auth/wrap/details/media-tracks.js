import { C, useAppContext } from 'snowstream'

const styles = {
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    }
}

export default function MediaTracksPage(props) {
    const { navPush, currentRoute, pushModal, popModal, SnowStyle } = C.useSnowContext(props)
    const {
        apiClient,
        clientOptions,
        isAdmin,
        routes,
    } = useAppContext()

    const [media, setMedia] = C.React.useState(null)
    const mediaRef = C.React.useRef(null)
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const audioTrackRef = C.React.useRef(0)
    const [audioLanguage, setAudioLanguage] = C.React.useState(null)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const subtitleTrackRef = C.React.useRef(0)
    const [videoFileIndex, setVideoFileIndex] = C.React.useState(0)
    const videoFileIndexRef = C.React.useRef(0)
    const videoFileRef = C.React.useRef(null)
    const [player, setPlayer] = C.React.useState(null)
    const playerRef = C.React.useRef(null)
    const [forcePlayer, setForcePlayer] = C.React.useState(null)
    const forcePlayerRef = C.React.useRef(null)
    const [showInfoModal, setShowInfoModal] = C.React.useState(false)
    const [shouldTranscode, setShouldTranscode] = C.React.useState(false)
    const shouldTranscodeRef = C.React.useRef(false)
    const [playParams, setPlayParams] = C.React.useState({})
    const [resumeParams, setResumeParams] = C.React.useState({})
    const [loadError, setLoadError] = C.React.useState(null)
    const [watchOverride, setWatchOverride] = C.React.useState(null)

    const [downloadProgress, setDownloadProgress] = C.React.useState(null)
    const [downloadDirectory, setDownloadDirectory] = C.React.useState(null)

    const shelfId = currentRoute.routeParams.shelfId

    const updatePlaybackParams = () => {
        if (!mediaRef.current) return

        const playDestination = {
            videoFileIndex: videoFileIndexRef.current,
            audioTrack: audioTrackRef.current,
            subtitleTrack: subtitleTrackRef.current,
            shelfId: shelfId,
            videoIsHdr: videoFileRef.current?.is_hdr ?? false
        }
        const mediaDestination = props.getPlayParameters(currentRoute.routeParams)
        let combinedPlayDestination = {
            ...playDestination,
            ...mediaDestination,
            transcode: shouldTranscodeRef.current
        }
        if (forcePlayerRef.current !== null) {
            combinedPlayDestination.forcePlayer = playerRef.current
        }
        else {
            delete combinedPlayDestination.forcePlayer
        }

        setPlayParams(combinedPlayDestination)

        if (mediaRef.current?.in_progress?.played_seconds) {
            setResumeParams({
                ...combinedPlayDestination,
                seekToSeconds: mediaRef.current.in_progress.played_seconds
            })
        }
        else {
            setResumeParams({})
        }
    }

    C.React.useEffect(() => {
        const savedDir = C.Snow.loadData('video_download_dir')
        if (savedDir && typeof savedDir === 'string') {
            setDownloadDirectory(savedDir)
        }
    }, [])

    C.React.useEffect(() => {
        props.loadMedia(apiClient, currentRoute.routeParams, clientOptions.deviceProfile).then((response) => {
            if (response?.video_files) {
                setMedia(response)
                mediaRef.current = response
                videoFileRef.current = response.video_files[videoFileIndexRef.current]

                if (response?.tags?.length) {
                    for (let tag of response.tags) {
                        if (tag?.name?.includes('AudioLanguage:')) {
                            const lang = tag.name.split(':')[1]
                            setAudioLanguage(lang)
                        }
                    }
                }

                let tracks = videoFileRef.current.info.tracks
                if (tracks.audio.length) {
                    audioTrackRef.current = tracks.audio[0].audio_index
                    setAudioTrack(audioTrackRef.current)
                }
                if (tracks.subtitle.length) {
                    subtitleTrackRef.current = tracks.subtitle[0].subtitle_index
                    setSubtitleTrack(subtitleTrackRef.current)
                }

                let plan = videoFileRef.current.plan
                if (plan) {
                    if (plan.player) {
                        playerRef.current = plan.player
                        forcePlayerRef.current = plan.player
                        setPlayer(plan.player)
                        setForcePlayer(plan.player)
                    }
                    else {
                        playerRef.current = 'mpv'
                        setPlayer('mpv')
                    }
                    if (plan.video_requires_transcode) {
                        shouldTranscodeRef.current = true
                        setShouldTranscode(true)
                    } else {
                        if (plan.audio_requires_transcode[audioTrackRef.current]) {
                            shouldTranscodeRef.current = true
                            setShouldTranscode(true)
                        }
                        if (plan.audio_requires_passthrough[audioTrackRef.current]) {
                            playerRef.current = 'exo'
                            forcePlayerRef.current = 'exo'
                            setPlayer('exo')
                            setForcePlayer('exo')
                        }
                    }
                }

                updatePlaybackParams()
            } else {
                setLoadError(true)
            }
        })
    }, [])

    const handleDownload = async () => {
        let targetDir = downloadDirectory
        if (!targetDir) {
            targetDir = await C.Snow.Download.pickDirectory()
            if (!targetDir) return
            await C.Snow.saveData('video_download_dir', targetDir)
            setDownloadDirectory(targetDir)
        }

        const mediaName = props.getMediaName ? props.getMediaName(currentRoute.routeParams, media) : media.name
        const ext = videoFileRef.current?.network_path.split('.').pop() || 'mkv'
        const fileName = `${mediaName.replace(/[/\\?%*:|"<>]/g, '-')}.${ext}`

        const downloadUrl = apiClient.getVideoDownloadUrl
            ? apiClient.getVideoDownloadUrl(media.id, videoFileRef.current?.file_index)
            : videoFileRef.current?.network_path

        setDownloadProgress(0)

        const progressSub = C.Snow.Download.addProgressListener((event) => {
            setDownloadProgress(event.progress)
        })

        try {
            await C.Snow.Download.download({
                url: downloadUrl,
                fileName: fileName,
                isTemp: false,
                treeUri: targetDir,
                openAfterDownload: false
            })
        } catch (error) {
            console.error("Video Download Error:", error)
        } finally {
            progressSub?.remove()
            setDownloadProgress(null)
        }
    }

    const setWatchStatus = (status) => {
        return props.toggleWatchStatus(apiClient, currentRoute.routeParams)
            .then((watched) => {
                setWatchOverride(watched)
            })
    }

    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            audioTrackRef.current = audioTrackRef.current == track.audio_index ? -1 : track.audio_index
            setAudioTrack(audioTrackRef.current)
        }
        if (track.kind === 'subtitle') {
            subtitleTrackRef.current = subtitleTrackRef.current == track.subtitle_index ? -1 : track.subtitle_index
            setSubtitleTrack(subtitleTrackRef.current)
        }
        updatePlaybackParams()
    }

    const chooseVideoFile = (fileIndex) => {
        videoFileIndexRef.current = fileIndex
        setVideoFileIndex(fileIndex)
        videoFileRef.current = mediaRef.current.video_files[fileIndex]
        let tracks = videoFileRef.current.info.tracks
        if (tracks.audio.length) {
            audioTrackRef.current = tracks.audio[0].audio_index
            setAudioTrack(audioTrackRef.current)
        }
        if (tracks.subtitle.length) {
            subtitleTrackRef.current = tracks.subtitle[0].subtitle_index
            setSubtitleTrack(subtitleTrackRef.current)
        }
        updatePlaybackParams()
    }

    const togglePlayer = () => {
        const nextPlayer = playerRef.current === 'exo' ? 'mpv' : 'exo'
        playerRef.current = nextPlayer
        forcePlayerRef.current = nextPlayer
        setPlayer(nextPlayer)
        setForcePlayer(nextPlayer)
        updatePlaybackParams()
    }

    const showInfo = () => {
        setShowInfoModal(true)
    }

    const toggleTranscode = () => {
        shouldTranscodeRef.current = !shouldTranscodeRef.current
        setShouldTranscode(shouldTranscodeRef.current)
        updatePlaybackParams()
    }

    C.React.useEffect(() => {
        if (showInfoModal) {
            let fileInfos = []
            for (const [key, value] of Object.entries(videoFileRef.current?.info)) {
                if (key !== 'tracks') {
                    fileInfos.push(`${key} [${value}]`)
                }
            }
            let videoInfos = []
            let audioInfos = []
            let subtitleInfos = []
            for (const [kind, tracks] of Object.entries(videoFileRef.current?.info.tracks)) {
                for (const track of tracks) {
                    let entry = []
                    for (const [trackKey, trackValue] of Object.entries(track)) {
                        entry.push(`${trackKey} [${trackValue}]`)
                    }
                    if (kind === 'video') {
                        videoInfos.push(entry)
                    }
                    if (kind === 'audio') {
                        audioInfos.push(entry)
                    }
                    if (kind == 'subtitle') {
                        subtitleInfos.push(entry)
                    }
                }
            }
            const InfoModal = (props) => {
                return (
                    <C.SnowView {...props}>
                        <C.SnowGrid focusStart focusKey="close-top" itemsPerRow={1}>
                            <C.SnowTextButton title="Close" onPress={() => { setShowInfoModal(false) }} />
                        </C.SnowGrid>
                        <C.SnowTabs focusKey="info-tabs" headers={['Video', 'Audio', 'Subtitle']}>
                            <C.SnowView>
                                <C.SnowText>{fileInfos.join(' ,  ')}</C.SnowText>
                                <C.SnowText>{videoInfos[0].join('   ')}</C.SnowText>
                                <C.SnowTarget focusKey="info-tabs-tab" />
                            </C.SnowView>
                            <C.SnowView>
                                {
                                    audioInfos.map((info, index) => {
                                        return (
                                            <C.SnowText key={'audio' + index}>{info.join('   ')}</C.SnowText>
                                        )
                                    })
                                }
                                <C.SnowTarget focusKey="info-tabs-tab" />
                            </C.SnowView>
                            <C.SnowView>
                                {
                                    subtitleInfos.map((info, index) => {
                                        return (
                                            <C.SnowText key={'subtitle' + index}>{info.join('   ')}</C.SnowText>
                                        )
                                    })
                                }
                                <C.SnowTarget focusKey="info-tabs-tab" />
                            </C.SnowView>
                        </C.SnowTabs>
                    </C.SnowView>
                )
            }
            pushModal({
                props: {
                    scroll: true,
                    onRequestClose: () => { setShowInfoModal(false) }
                },
                render: InfoModal
            })
        }
        return () => {
            popModal()
        }
    }, [showInfoModal, media])

    if (loadError) {
        return <C.SnowHeader center>Unable to load video files for this content.</C.SnowHeader>
    }

    if (media) {
        if (!videoFileRef.current) {
            return <C.SnowText>No video file found for this selection.</C.SnowText>
        }
        const videoTrack = videoFileRef.current?.info.tracks.video[0]

        let watchBase = media.watched
        if (watchOverride !== null) {
            watchBase = watchOverride
        }
        const watchTitle = watchBase ? "Mark Unwatched (hold)" : "Mark Watched (hold)"

        let remoteMetadataId = ''
        if (media.remote_metadata_id) {
            remoteMetadataId = media.remote_metadata_id
        }
        else if (props.getRemoteMetadataId) {
            remoteMetadataId = props.getRemoteMetadataId(media)
        }

        let playTitle = 'Play'
        let resumeControls = null
        if (media?.in_progress?.played_seconds) {
            playTitle = 'Play from Start'
            resumeControls = (
                <C.SnowTextButton
                    key="resume-button"
                    tall
                    title={`Resume from ${C.util.secondsToTimestamp(media.in_progress.played_seconds)}`}
                    onPress={() => {
                        navPush({
                            path: props.getPlayRoute(routes),
                            params: resumeParams,
                            func: false
                        })
                    }}
                    onLongPress={() => {
                        navPush({
                            path: props.getPlayRoute(routes),
                            params: {
                                ...resumeParams,
                                logPlayback: true
                            },
                            func: false
                        })
                    }}
                />
            )
        }
        let tabs = [
            'Control'
        ]
        let playerDisplay = `[mpv] / exo`
        if (player === 'exo') {
            playerDisplay = `mpv / [exo]`
        }
        let transcodeDisplay = `[Direct Play] / Transcode`
        if (shouldTranscode) {
            transcodeDisplay = `Direct Play / [Transcode]`
        }
        const controlTab = (
            <C.SnowView>
                <C.SnowGrid>
                    <C.SnowTextButton tall title={media.shelf_name} onPress={props.gotoShelf(routes, navPush, currentRoute.routeParams)} />
                    {props.getNavButtons ? props.getNavButtons(routes, navPush, currentRoute.routeParams).map((button) => { return button }) : null}
                </C.SnowGrid>
                <C.SnowGrid focusKey="player">
                    <C.SnowTextButton tall title={watchTitle} onLongPress={setWatchStatus} />
                    <C.SnowTextButton
                        title={playerDisplay}
                        tall
                        onPress={togglePlayer}
                    />
                    <C.SnowTextButton
                        title={transcodeDisplay}
                        tall
                        onPress={toggleTranscode}
                    />
                </C.SnowGrid>
            </C.SnowView>
        )

        let versionTab = null
        if (media.has_versions) {
            tabs.push('Version')
            versionTab = (
                <C.SnowView>
                    <C.SnowDropdown
                        options={media.video_files.filter(ff => ff.version).map((ff) => {
                            return { name: ff.version, index: ff.file_index }
                        })}
                        onValueChange={chooseVideoFile}
                        valueIndex={videoFileIndex}
                    />
                </C.SnowView>
            )
        }

        let fileTab = null
        if (media.has_extras) {
            tabs.push('Video')
            fileTab = (
                <C.SnowView>
                    <C.SnowTextButton title="Main Feature" onPress={() => {
                        chooseVideoFile(media.main_feature_index)
                    }} />
                    <C.SnowDropdown
                        skipDefaultFocus
                        focusKey="video-picker"
                        options={media.video_files.filter(ff => ff.is_extra).map((ff) => {
                            return { name: ff.name, index: ff.file_index }
                        })}
                        onValueChange={chooseVideoFile}
                        valueIndex={videoFileIndex}
                    />
                </C.SnowView>
            )
        }

        tabs.push('Track')
        const trackTab = (
            <C.SnowView>
                <C.SnowTrackSelector
                    tracks={videoFileRef.current?.info.tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    audioLanguage={audioLanguage}
                    subtitleTrack={subtitleTrack}
                />
            </C.SnowView>
        )
        tabs.push('Info')

        const infoActions = [
            <C.SnowTextButton
                key="inspection-btn"
                tall
                title="Inspection"
                onPress={showInfo}
            />
        ]

        if (!SnowStyle.isTV && !SnowStyle.isWeb) {
            infoActions.push(
                <C.SnowTextButton
                    key="download-btn"
                    tall
                    title={downloadProgress !== null ? `Downloading ${downloadProgress}%` : "Download"}
                    disabled={downloadProgress !== null}
                    onPress={handleDownload}
                />)
        }

        if (isAdmin) {
            infoActions.push(
                <C.SnowCreateJobButton
                    key="create-job-btn"
                    tall
                    title="Create Job"
                    jobDetails={{
                        metadataId: remoteMetadataId,
                        ...props.getJobTarget(currentRoute.routeParams)
                    }}
                />
            )
        }

        const infoTab = (
            <C.SnowView>
                <C.SnowGrid focusKey="inspection-top" itemsPerRow={infoActions.length}>
                    {infoActions}
                </C.SnowGrid>
                <C.SnowText center>Path: {videoFileRef.current?.network_path}</C.SnowText>
                <C.SnowGrid itemsPerRow={2}>
                    <C.SnowView>
                        <C.SnowText>Overall Quality: {C.util.bitsToPretty(videoFileRef.current?.info.bit_rate)}/s</C.SnowText>
                        <C.SnowText>Video Quality: {C.util.bitsToPretty(videoTrack.bit_rate, true)}/s {videoTrack.is_hdr ? 'HDR' : 'SDR'}</C.SnowText>
                        <C.SnowText>File Size: {C.util.bitsToPretty(videoFileRef.current?.info.bit_file_size, false)}</C.SnowText>
                        <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                    </C.SnowView>
                    <C.SnowView
                        style={styles.image}>
                        <C.SnowLabel>Discussion</C.SnowLabel>
                        <C.SnowImageButton
                            wrapperStyle={{
                                width: 300,
                                height: 300
                            }}
                            imageStyle={{
                                width: 275,
                                height: 275
                            }}
                            focusKey="discussion-button"
                            imageSource={{ uri: media.discussion_image_url }}
                            onPress={() => {
                                C.Linking.openURL(media.discussion_url)
                            }}
                        />
                    </C.SnowView>
                </C.SnowGrid>
                <C.SnowTarget />
            </C.SnowView>
        )

        tabs.push('Plan')
        const planTab = (
            <C.SnowGrid itemsPerRow={2}>
                <C.SnowTextButton title="Plan" />
                <C.SnowText >Plan: {C.Snow.stringifySafe(videoFileRef.current?.plan, null, 4)}</C.SnowText>
                <C.SnowTextButton title="Params" />
                <C.SnowText >Params: {C.Snow.stringifySafe(currentRoute.routeParams, null, 4)}</C.SnowText>
                <C.SnowTextButton title="Options" />
                <C.SnowText >Options: {C.Snow.stringifySafe(clientOptions, null, 4)}</C.SnowText>
            </C.SnowGrid>
        )

        return (
            <C.SnowView>
                <C.SnowView>
                    <C.SnowLabel center>
                        {props.getMediaName ? props.getMediaName(currentRoute.routeParams, media) : media.name}
                    </C.SnowLabel>
                    {videoFileRef.current?.info?.duration_seconds ? (
                        <C.SnowText center>
                            Runtime {C.util.secondsToTimestamp(videoFileRef.current?.info?.duration_seconds, true)}
                            {mediaRef.current?.has_versions ? ` - Version [${videoFileRef.current?.version}]` : null}
                        </C.SnowText>
                    ) : null}
                    <C.SnowGrid
                        focusStart
                        focusKey="play-controls">
                        {resumeControls}
                        <C.SnowTextButton
                            key="play-button"
                            tall
                            title={playTitle}
                            onPress={() => {
                                navPush({
                                    path: props.getPlayRoute(routes),
                                    params: playParams,
                                    func: false
                                })
                            }}
                            onLongPress={() => {
                                navPush({
                                    path: props.getPlayRoute(routes),
                                    params: {
                                        ...playParams,
                                        logPlayback: true
                                    },
                                    func: false
                                })
                            }}

                        />
                    </C.SnowGrid>
                </C.SnowView>
                <C.SnowView>
                    <C.SnowTabs focusKey="media-tabs" headers={tabs}>
                        {controlTab}
                        {versionTab}
                        {fileTab}
                        {trackTab}
                        {infoTab}
                        {planTab}
                    </C.SnowTabs >
                </C.SnowView>
            </C.SnowView>
        )
    }

    let loadingName = props.mediaKind
    if (currentRoute.routeParams?.movieName) {
        loadingName = `movie ${currentRoute.routeParams?.movieName}`
    }
    if (currentRoute.routeParams?.showName) {
        loadingName = `${currentRoute.routeParams?.showName}`
        if (currentRoute.routeParams?.seasonOrder) {
            loadingName = `${loadingName} Season ${currentRoute.routeParams?.seasonOrder}`
            if (currentRoute.routeParams?.episodeOrder) {
                loadingName = `${loadingName} Episode ${currentRoute.routeParams?.episodeOrder}`
            }
        }
    }

    return (
        <C.SnowLabel center>
            Loading {loadingName}.
        </C.SnowLabel>
    )
}