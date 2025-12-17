import { C, useAppContext } from 'snowstream'
import Player from 'snowstream-player'

const styles = {
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    }
}

export default function MediaTracksPage(props) {
    const { navPush, currentRoute, pushModal, popModal } = C.useSnowContext()
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
    const [showInfoModal, setShowInfoModal] = C.React.useState(false)
    const [shouldTranscode, setShouldTranscode] = C.React.useState(false)
    const [playParams, setPlayParams] = C.React.useState({})
    const [resumeParams, setResumeParams] = C.React.useState({})
    const [loadError, setLoadError] = C.React.useState(null)
    const [watchOverride, setWatchOverride] = C.React.useState(null)

    const shelfId = currentRoute.routeParams.shelfId;

    let videoFile = null
    if (media) {
        videoFile = media.video_files[videoFileIndex]
    }

    C.React.useEffect(() => {
        Player.action.reset()
    }, [])

    C.React.useEffect(() => {
        if (media) {
            const playDestination = {
                videoFileIndex: videoFileIndex,
                audioTrack: audioTrack,
                subtitleTrack: subtitleTrack,
                shelfId: shelfId,
                videoIsHdr: videoFile.is_hdr
            }
            const mediaDestination = props.getPlayParameters(currentRoute.routeParams)
            let combinedPlayDestination = { ...playDestination, ...mediaDestination, transcode: shouldTranscode }
            if (forcePlayer !== null) {
                combinedPlayDestination.forcePlayer = player
            }
            else {
                delete combinedPlayDestination.forcePlayer;
            }
            setPlayParams(combinedPlayDestination)
            if (media?.in_progress?.played_seconds) {
                setResumeParams({
                    ...combinedPlayDestination,
                    seekToSeconds: media.in_progress.played_seconds
                })
            }
        }
    }, [player, forcePlayer, media, videoFileIndex, subtitleTrack, audioTrack, shelfId, shouldTranscode])

    C.React.useEffect(() => {
        if (!media) {
            props.loadMedia(apiClient, currentRoute.routeParams, clientOptions.deviceProfile).then((response) => {
                if (response?.video_files) {
                    setMedia(response)
                    chooseVideoFile(videoFileIndex, response)
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
                } else {
                    setLoadError(true)
                }
            })
        }
    }, [media])

    const setWatchStatus = (status) => {
        return props.toggleWatchStatus(apiClient, currentRoute.routeParams)
            .then((watched) => {
                setWatchOverride(watched)
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

    const chooseVideoFile = (fileIndex, target) => {
        if (!target) {
            target = media
        }
        setVideoFileIndex(fileIndex)
        if (target.video_files[fileIndex].info.tracks.audio.length) {
            setAudioTrack(target.video_files[fileIndex].info.tracks.audio[0].audio_index)
        }
        if (target.video_files[fileIndex].info.tracks.subtitle.length) {
            setSubtitleTrack(target.video_files[fileIndex].info.tracks.subtitle[0].subtitle_index)
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
        setShowInfoModal(true)
    }

    const toggleTranscode = () => {
        setShouldTranscode(!shouldTranscode)
    }

    C.React.useEffect(() => {
        if (showInfoModal) {
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
            const InfoModal = () => {
                return (
                    <C.FillView>
                        <C.SnowGrid focusStart focusKey="close-top" focusDown="info-tabs" itemsPerRow={1}>
                            <C.SnowTextButton title="Close" onPress={() => { setShowInfoModal(false) }} />
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
                    </C.FillView>
                )
            }
            pushModal({
                props: {
                    focusLayer: "video-inspection",
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
        if (!videoFile) {
            return <C.SnowText>No video file found for this selection.</C.SnowText>
        }
        const videoTrack = videoFile.info.tracks.video[0]

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
        let playFocus = true
        if (media?.in_progress?.played_seconds) {
            playFocus = false
            playTitle = 'Play from Start'
            resumeControls = (
                <C.SnowTextButton
                    key={C.Snow.stringifySafe(resumeParams)}
                    focusStart
                    tall
                    title={`Resume from ${C.util.secondsToTimestamp(media.in_progress.played_seconds)}`}
                    onPress={() => {
                        navPush({
                            path: props.getPlayRoute(routes),
                            params: resumeParams,
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
                <C.SnowGrid focusDown="player" itemsPerRow={4}>
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
                    <C.SnowTextButton focusDown="video-picker" title="Main Feature" onPress={() => {
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
                    tracks={videoFile.info.tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    subtitleTrack={subtitleTrack}
                />
            </C.SnowView>
        )
        tabs.push('Info')
        const infoTab = (
            <C.SnowView>
                <C.SnowGrid focusKey="inspection-top" focusDown="discussion-button" itemsPerRow={3}>
                    <C.SnowTextButton
                        tall
                        title="Inspection"
                        onPress={showInfo}
                    />
                    {isAdmin ? <C.SnowCreateJobButton
                        tall
                        title="Create Job"
                        jobDetails={{
                            metadataId: remoteMetadataId,
                            ...props.getJobTarget(currentRoute.routeParams)
                        }} /> : null}
                </C.SnowGrid>
                <C.SnowText center>Path: {videoFile.network_path}</C.SnowText>
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
                        <C.SnowImageButton
                            focusKey="discussion-button"
                            title="Discussion"
                            imageSource={{ uri: media.discussion_image_url }}
                            onPress={() => {
                                C.Linking.openURL(media.discussion_url)
                            }}
                        />
                    </C.SnowView>
                </C.SnowGrid>
            </C.SnowView>
        )

        tabs.push('Plan')
        const planTab = (
            <C.SnowGrid assignFocus={false} itemsPerRow={3}>
                <C.SnowText >Params: {C.Snow.stringifySafe(currentRoute.routeParams, null, 4)}</C.SnowText>
                <C.SnowText >Plan: {C.Snow.stringifySafe(videoFile.plan, null, 4)}</C.SnowText>
                <C.SnowText >Options: {C.Snow.stringifySafe(clientOptions, null, 4)}</C.SnowText>
            </C.SnowGrid>
        )

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
                            key={C.Snow.stringifySafe(playParams)}
                            tall
                            title={playTitle}
                            onPress={() => {
                                navPush({
                                    path: props.getPlayRoute(routes),
                                    params: playParams,
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
    return (
        <C.SnowText>
            Loading {props.mediaKind} {currentRoute.routeParams.movieId ? currentRoute.routeParams.movieId : currentRoute.routeParams.episodeId}.
        </C.SnowText>
    );
}
