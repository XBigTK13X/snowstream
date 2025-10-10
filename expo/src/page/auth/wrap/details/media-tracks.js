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
    const { navPush, currentRoute } = C.useSnowContext()
    const {
        apiClient,
        clientOptions,
        isAdmin,
        routes,
    } = useAppContext();

    const [media, setMedia] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFileIndex, setVideoFileIndex] = C.React.useState(0)
    const [player, setPlayer] = C.React.useState(null)
    const [forcePlayer, setForcePlayer] = C.React.useState(null)
    const [showModal, setShowModal] = C.React.useState(false)
    const [shouldTranscode, setShouldTranscode] = C.React.useState(false)

    console.log({ currentRoute })

    const shelfId = currentRoute.routeParams.shelfId;

    C.React.useEffect(() => {
        if (!media) {
            props.loadMedia(apiClient, currentRoute.routeParams, clientOptions.deviceProfile).then((response) => {
                setMedia(response)
                let plan = response.video_files[videoFileIndex].plan
                if (plan) {
                    if (plan.player) {
                        setPlayer(plan.player)
                        setForcePlayer(plan.player)
                    }
                    else {
                        setPlayer('mpv')
                    }
                    if (plan.video_requires_transcode) {
                        setShouldTranscode(true)
                    } else {
                        if (plan.audio_requires_transcode[audioTrack]) {
                            setShouldTranscode(true)
                        }
                    }
                }
            })
        }
    }, [media])
    const setWatchStatus = (status) => {
        return props.toggleWatchStatus(apiClient, currentRoute.routeParams)
            .then(() => {
                return props.loadMedia(apiClient, currentRoute.routeParams, clientOptions.deviceProfile)
            })
            .then((response) => {
                setMedia(response)
            })
    }
    const selectTrack = (track) => {
        if (track.kind === 'audio') {
            if (audioTrack == track.audio_index) {
                setAudioTrack(-1)
            } else {
                setAudioTrack(track.audio_index)
            }
        }
        if (track.kind === 'subtitle') {
            if (subtitleTrack == track.subtitle_index) {
                setSubtitleTrack(-1)
            } else {
                setSubtitleTrack(track.subtitle_index)
            }
        }
    }

    const chooseVideoFile = (fileIndex) => {
        setVideoFileIndex(fileIndex)
        if (media.video_files[fileIndex].info.tracks.audio.length) {
            setAudioTrack(media.video_files[fileIndex].info.tracks.audio[0].audio_index)
        }
        if (media.video_files[fileIndex].info.tracks.subtitle.length) {
            setSubtitleTrack(media.video_files[fileIndex].info.tracks.subtitle[0].subtitle_index)
        }
    }

    const togglePlayer = () => {
        if (player === 'exo') {
            setPlayer('mpv')
            setForcePlayer('mpv')
        }
        else {
            setPlayer('exo')
            setForcePlayer('exo')
        }
    }

    const showInfo = () => {
        setShowModal(true)
    }

    const toggleTranscode = () => {
        setShouldTranscode(!shouldTranscode)
    }

    if (media) {
        const videoFile = media.video_files[videoFileIndex]
        if (!videoFile) {
            return <SnowText>No video file found for this selection.</SnowText>
        }
        const videoTrack = videoFile.info.tracks.video[0]
        if (showModal) {
            let fileInfos = []
            for (const [key, value] of Object.entries(videoFile.info)) {
                if (key !== 'tracks') {
                    fileInfos.push(`${key} [${value}]`)
                }
            }
            let videoInfos = []
            let audioInfos = []
            let subtitleInfos = []
            for (const [kind, tracks] of Object.entries(videoFile.info.tracks)) {
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
            return (
                <C.SnowModal
                    focusLayer="video-inspection"
                    scroll
                    onRequestClose={() => { setShowModal(false) }}
                >
                    <C.SnowGrid focusStart focusKey="close-top" focusDown="info-tabs" itemsPerRow={1}>
                        <C.SnowTextButton title="Close" onPress={() => { setShowModal(false) }} />
                    </C.SnowGrid>
                    <C.SnowTabs focusKey="info-tabs" focusDown="info-bottom" headers={['Video', 'Audio', 'Subtitle']}>
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
                </C.SnowModal>
            )
        }
        const watchTitle = media.watched ? "Mark Unwatched (hold)" : "Mark Watched (hold)"
        const playDestination = {
            videoFileIndex: videoFileIndex,
            audioTrack: audioTrack,
            subtitleTrack: subtitleTrack,
            shelfId: shelfId,
            videoIsHdr: videoFile.is_hdr
        }
        let mainFeatureButton = null
        if (media.has_extras) {
            mainFeatureButton = <C.SnowTextButton title="Main Feature" onPress={() => {
                chooseVideoFile(media.main_feature_index)
            }} />
        }
        let versionPicker = null
        if (media.has_versions) {
            versionPicker = (
                <C.View>
                    <C.SnowLabel>Version</C.SnowLabel>
                    <C.SnowDropdown
                        options={media.video_files.filter(ff => ff.version).map((ff) => {
                            return ff.version
                        })}
                        onValueChange={chooseVideoFile}
                        valueIndex={videoFileIndex}
                    />
                </C.View>
            )
        }
        let extraPicker = null
        if (media.has_extras) {
            extraPicker = (
                <C.View>
                    <C.SnowLabel>Extras</C.SnowLabel>
                    <C.SnowDropdown
                        skipDefaultFocus
                        options={media.video_files.filter(ff => ff.is_extra).map((ff) => {
                            return { name: ff.name, index: ff.file_index }
                        })}
                        onValueChange={chooseVideoFile}
                        valueIndex={videoFileIndex}
                    />
                </C.View>
            )
        }
        let remoteMetadataId = ''
        if (media.remote_metadata_id) {
            remoteMetadataId = media.remote_metadata_id
        }
        else if (props.getRemoteMetadataId) {
            remoteMetadataId = props.getRemoteMetadataId(media)
        }
        const mediaDestination = props.getPlayParameters(currentRoute.routeParams)
        let combinedPlayDestination = { ...playDestination, ...mediaDestination, transcode: shouldTranscode }
        if (forcePlayer !== null) {
            combinedPlayDestination = { ...combinedPlayDestination, forcePlayer: player }
        }
        let playTitle = 'Play'
        let resumeControls = null
        let playFocus = true
        if (media.in_progress && media.in_progress.played_seconds) {
            playFocus = false
            playTitle = 'Play from Start'
            const resumePlayDestination = {
                ...combinedPlayDestination,
                seekToSeconds: media.in_progress.played_seconds
            }
            resumeControls = (
                <C.SnowTextButton
                    focusStart
                    tall
                    title={`Resume from ${C.util.secondsToTimestamp(media.in_progress.played_seconds)}`}
                    onPress={navPush(props.getPlayRoute(routes), resumePlayDestination, true)}
                />
            )
        }
        const tabs = [
            'Control',
            'Track',
            'Info'
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
                <C.SnowGrid focusDown="player" itemsPerRow={4}>
                    {mainFeatureButton}
                    <C.SnowTextButton tall title={media.shelf_name} onPress={props.gotoShelf(routes, navPush, currentRoute.routeParams)} />
                    {props.getNavButtons ? props.getNavButtons(routes, navPush, currentRoute.routeParams).map((button) => { return button }) : null}
                </C.SnowGrid>
                <C.SnowGrid focusKey="player" itemsPerRow={4}>
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
        const trackTab = (
            <C.SnowView>
                {versionPicker}
                {extraPicker}
                <C.SnowTrackSelector
                    tracks={videoFile.info.tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    subtitleTrack={subtitleTrack}
                />
            </C.SnowView>
        )
        const infoTab = (
            <C.SnowView>
                <C.SnowGrid focusKey="inspection-top" focusDown="inspection-middle" itemsPerRow={3}>
                    <C.SnowTextButton
                        tall
                        title="Inspection"
                        onPress={showInfo}
                    />
                </C.SnowGrid>
                <C.SnowGrid assignFocus={false} itemsPerRow={2}>
                    <C.SnowView>
                        <C.SnowText>Overall Quality: {C.util.bitsToPretty(videoFile.info.bit_rate)}/s</C.SnowText>
                        <C.SnowText>Video Quality: {C.util.bitsToPretty(videoTrack.bit_rate, true)}/s {videoTrack.is_hdr ? 'HDR' : 'SDR'}</C.SnowText>
                        <C.SnowText>File Size: {C.util.bitsToPretty(videoFile.info.bit_file_size, false)}</C.SnowText>
                        <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                    </C.SnowView>
                    <C.SnowView
                        style={styles.image}>
                        <C.SnowLabel>Discussion</C.SnowLabel>
                        <C.Image
                            source={{ uri: media.discussion_image_url }}
                            style={{ width: 200, height: 200 }}
                        />
                    </C.SnowView>
                </C.SnowGrid>
                <C.SnowTarget focusKey="inspection-middle" focusDown="inspection-bottom" />
                <C.SnowText >Path: {videoFile.network_path}</C.SnowText>
                <C.SnowGrid assignFocus={false} itemsPerRow={3}>
                    <C.SnowText >Params: {JSON.stringify(currentRoute.routeParams, null, 4)}</C.SnowText>
                    <C.SnowText >Plan: {JSON.stringify(videoFile.plan, null, 4)}</C.SnowText>
                    <C.SnowText >Options: {JSON.stringify(clientOptions, null, 4)}</C.SnowText>
                </C.SnowGrid>
                <C.SnowTarget focusKey="inspection-bottom" />
            </C.SnowView>
        )
        let adminTab = null
        if (isAdmin) {
            tabs.push('Admin')
            adminTab = (
                <C.SnowView>
                    <C.SnowGrid itemsPerRow={2}>
                        <C.SnowTextButton
                            title={`Rescan ${props.mediaKind}`}
                            tall
                            onPress={() => {
                                const scanDetails = props.getScanDetails(currentRoute.routeParams)
                                return apiClient.createJobShelvesScan(scanDetails).then(() => {
                                    let readDetails = { ...scanDetails, ...{ updateVideos: true, updateMetadata: true } }
                                    return apiClient.createJobReadMediaFiles(readDetails)
                                })
                            }} />
                        <C.SnowUpdateMediaButton
                            tall
                            remoteId={remoteMetadataId}
                            kind={props.mediaKind}
                            updateMediaJob={(promptDetails) => {
                                const mediaDetails = props.getUpdateMediaJobDetails(currentRoute.routeParams)
                                return apiClient.createJobUpdateMediaFiles({ ...promptDetails, ...mediaDetails })
                            }} />
                    </C.SnowGrid>
                </C.SnowView>
            )
        }
        return (
            <C.SnowView>
                <C.SnowView>
                    <C.SnowLabel center>
                        {props.getMediaName ? props.getMediaName(currentRoute.routeParams, media) : media.name}
                    </C.SnowLabel>
                    <C.SnowGrid
                        focusStart
                        focusKey="page-entry"
                        focusDown="media-tabs"
                        itemsPerRow={4}>
                        {resumeControls}
                        <C.SnowTextButton
                            tall
                            title={playTitle}
                            onPress={navPush(props.getPlayRoute(routes), combinedPlayDestination, true)}
                        />
                    </C.SnowGrid>
                </C.SnowView>
                <C.SnowView>
                    <C.SnowTabs focusKey="media-tabs" headers={tabs}>
                        {controlTab}
                        {trackTab}
                        {infoTab}
                        {adminTab}
                    </C.SnowTabs >
                </C.SnowView>
            </C.SnowView>
        )
    }
    return (
        <C.SnowText>
            Loading {props.mediaKind} {currentRoute.routeParams.movieId ? currentRoute.routeParams.movieId : currentRoute.routeParams.episodeId}.
        </C.SnowText>
    );
}
