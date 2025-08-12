import C from '../../../common'

const styles = {
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    }
}

export default function MediaTracksPage(props) {
    const { apiClient, isAdmin } = C.useAppContext();
    const { routes } = C.useAppContext();
    const localParams = C.useLocalSearchParams();

    const [shelf, setShelf] = C.React.useState(null);
    const [media, setMedia] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFileIndex, setVideoFileIndex] = C.React.useState(0)
    const [player, setPlayer] = C.React.useState(C.isWeb ? 'exo' : 'mpv')
    const [forcePlayer, setForcePlayer] = C.React.useState(null)
    const [showModal, setShowModal] = C.React.useState(false)

    const shelfId = localParams.shelfId;

    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })
            props.loadMedia(apiClient, localParams).then((response) => {
                setMedia(response)
                if (response.video_files[videoFileIndex].is_hdr) {
                    setPlayer('exo')
                    setForcePlayer('exo')
                }
            })
        }
    })
    const setWatchStatus = (status) => {
        return props.toggleWatchStatus(apiClient, localParams)
            .then(() => {
                return props.loadMedia(apiClient, localParams)
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

    if (shelf && media) {
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
                    onRequestClose={() => { setShowModal(false) }}
                >
                    <C.SnowGrid shrink itemsPerRow={1}>
                        <C.SnowTextButton title="Close" onPress={() => { setShowModal(false) }} />
                    </C.SnowGrid>
                    <C.FillView scroll>
                        <C.SnowLabel>Video File Info</C.SnowLabel>
                        <C.SnowText>{fileInfos.join(' ,  ')}</C.SnowText>
                        <C.SnowText>{videoInfos[0].join('   ')}</C.SnowText>
                        <C.SnowLabel>Audio Info</C.SnowLabel>
                        {
                            audioInfos.map((info, index) => {
                                return (
                                    <C.SnowText key={'audio' + index}>{info.join('   ')}</C.SnowText>
                                )
                            })
                        }
                        <C.SnowLabel>Subtitle Info</C.SnowLabel>
                        {
                            subtitleInfos.map((info, index) => {
                                return (
                                    <C.SnowText key={'subtitle' + index}>{info.join('   ')}</C.SnowText>
                                )
                            })
                        }
                    </C.FillView>
                    <C.SnowGrid shrink itemsPerRow={1}>
                        <C.SnowTextButton title="Close" onPress={() => { setShowModal(false) }} />
                    </C.SnowGrid>
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
        const mediaDestination = props.getPlayParameters(localParams)
        let combinedPlayDestination = { ...playDestination, ...mediaDestination }
        if (forcePlayer !== null) {
            combinedPlayDestination = { ...combinedPlayDestination, ...{ forcePlayer: player } }
        }
        const transcodePlayDestination = { ...combinedPlayDestination, ...{ transcode: true } }
        let playTitle = 'Play'
        let resumeControls = null
        let playFocus = true
        if (media.in_progress && media.in_progress.played_seconds) {
            playFocus = false
            playTitle = 'Play from Start'
            const resumePlayDestination = {
                ...combinedPlayDestination, ...{ seekToSeconds: media.in_progress.played_seconds }
            }
            resumeControls = (
                <C.SnowTextButton
                    shouldFocus
                    tall
                    title={`Resume from ${C.util.secondsToTimestamp(media.in_progress.played_seconds)}`}
                    onPress={routes.func(props.getPlayRoute(routes), resumePlayDestination)}
                />
            )
        }
        const tabs = [
            'Control',
            'Track',
            'Info'
        ]
        let adminTab = null
        if (isAdmin) {
            tabs.push('Admin')
            adminTab = (
                <C.FillView>
                    <C.SnowGrid shrink itemsPerRow={2}>
                        <C.SnowTextButton
                            title={`Rescan ${props.mediaKind}`}
                            tall
                            onPress={() => {
                                const scanDetails = props.getScanDetails(localParams)
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
                                const mediaDetails = props.getUpdateMediaJobDetails(localParams)
                                return apiClient.createJobUpdateMediaFiles({ ...promptDetails, ...mediaDetails })
                            }} />
                    </C.SnowGrid>
                </C.FillView>
            )
        }
        return (
            <C.FillView>
                <C.FillView>
                    <C.SnowLabel center>
                        {props.getMediaName ? props.getMediaName(localParams, media) : media.name}
                    </C.SnowLabel>
                    <C.SnowGrid itemsPerRow={4}>
                        {resumeControls}
                        <C.SnowTextButton
                            tall
                            shouldFocus={playFocus}
                            title={playTitle}
                            onPress={routes.func(props.getPlayRoute(routes), combinedPlayDestination)}
                        />
                    </C.SnowGrid>
                </C.FillView>
                <C.FillView>
                    <C.SnowTabs headers={tabs}>
                        <C.FillView>
                            <C.SnowGrid shrink itemsPerRow={4}>
                                {/*<C.SnowTextButton
                        shouldFocus={playFocus}
                        title="Transcode"
                        onPress={routes.func(props.getPlayRoute(routes), transcodePlayDestination)}
                    />*/}
                                {mainFeatureButton}
                                <C.SnowTextButton tall title={shelf.name} onPress={props.gotoShelf(routes, localParams)} />
                                {props.getNavButtons ? props.getNavButtons(routes, localParams).map((button) => { return button }) : null}
                            </C.SnowGrid>
                            <C.SnowGrid itemsPerRow={4}>
                                <C.SnowTextButton tall title={watchTitle} onLongPress={setWatchStatus} />
                                <C.SnowTextButton
                                    title={`Toggle Player [${player}]`}
                                    tall
                                    onPress={togglePlayer}
                                />
                            </C.SnowGrid>
                        </C.FillView>
                        <C.FillView>
                            {versionPicker}
                            {extraPicker}
                            <C.SnowTrackSelector
                                tracks={videoFile.info.tracks}
                                selectTrack={selectTrack}
                                audioTrack={audioTrack}
                                subtitleTrack={subtitleTrack}
                            />
                        </C.FillView>
                        <C.FillView>
                            <C.SnowText center>Path: {videoFile.network_path}</C.SnowText>
                            <C.SnowGrid shrink itemsPerRow={3}>
                                <C.SnowTextButton
                                    tall
                                    title="Inspection"
                                    onPress={showInfo}
                                />
                            </C.SnowGrid>
                            <C.SnowGrid shrink itemsPerRow={2}>
                                <C.View>

                                    <C.SnowText>Overall Quality: {C.util.bitsToPretty(videoFile.info.bit_rate)}/s</C.SnowText>
                                    <C.SnowText>Video Quality: {C.util.bitsToPretty(videoTrack.bit_rate, true)}/s {videoTrack.is_hdr ? 'HDR' : 'SDR'}</C.SnowText>
                                    <C.SnowText>File Size: {C.util.bitsToPretty(videoFile.info.bit_file_size, false)}</C.SnowText>
                                    <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                                </C.View>
                                <C.View
                                    style={styles.image}>
                                    <C.SnowLabel>Discussion</C.SnowLabel>
                                    <C.Image
                                        source={{ uri: media.discussion_image_url }}
                                        style={{ width: 200, height: 200 }}
                                    />
                                </C.View>
                            </C.SnowGrid>
                        </C.FillView>
                        {adminTab}
                    </C.SnowTabs >
                </C.FillView >
            </C.FillView >
        )
    }
    return (
        <C.SnowText>
            Loading {props.mediaKind} {localParams.movieId ? localParams.movieId : localParams.episodeId}.
        </C.SnowText>
    );
}
