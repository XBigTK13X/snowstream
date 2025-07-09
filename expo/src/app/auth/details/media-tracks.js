import C from '../../../common'

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
            setAudioTrack(track.audio_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrack(track.subtitle_index)
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
        const videoTrack = videoFile.info.tracks.video[0]
        console.log({ track: videoFile.info.tracks })
        if (showModal) {
            const snowstreamInfo = JSON.parse(videoFile.snowstream_info_json)
            let fileInfos = []
            for (const [key, value] of Object.entries(snowstreamInfo)) {
                if (key !== 'tracks') {
                    fileInfos.push(`${key} [${value}]`)
                }
            }
            let videoInfos = []
            let audioInfos = []
            let subtitleInfos = []
            for (const [kind, tracks] of Object.entries(snowstreamInfo.tracks)) {
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
            shelfId: shelfId
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
                        onChoose={chooseVideoFile}
                        value={videoFileIndex}
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
                        onChoose={chooseVideoFile}
                        value={videoFileIndex}
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
        const mediaDestination = props.getPlayDestination(localParams)
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
                    title={`Resume from ${C.util.secondsToTimestamp(media.in_progress.played_seconds)}`}
                    onPress={routes.func(routes.playMedia, resumePlayDestination)}
                />
            )
        }
        return (
            <C.FillView scroll>
                <C.View>
                    <C.SnowLabel center>
                        {props.getMediaName ? props.getMediaName(localParams, media) : media.name}
                    </C.SnowLabel>
                    <C.SnowGrid itemsPerRow={2} substantial>
                        {resumeControls}
                        <C.SnowTextButton
                            shouldFocus={playFocus}
                            title={playTitle}
                            onPress={routes.func(routes.playMedia, combinedPlayDestination)}
                        />
                        {/*<C.SnowTextButton
                        shouldFocus={playFocus}
                        title="Transcode"
                        onPress={routes.func(routes.playMedia, transcodePlayDestination)}
                    />*/}
                        {mainFeatureButton}
                        <C.SnowTextButton title={watchTitle} onLongPress={setWatchStatus} />
                        <C.SnowTextButton title={shelf.name} onPress={props.gotoShelf(routes, localParams)} />
                        {props.getNavButtons ? props.getNavButtons(routes, localParams).map((button) => { return button }) : null}
                        {isAdmin ? <C.SnowTextButton title={`Rescan ${props.mediaKind}`}
                            onPress={() => {
                                const scanDetails = props.getScanDetails(localParams)
                                return apiClient.createJobShelvesScan(scanDetails).then(() => {
                                    let readDetails = { ...scanDetails, ...{ updateVideos: true, updateMetadata: true } }
                                    return apiClient.createJobReadMediaFiles(readDetails)
                                })
                            }} /> : null}
                        {isAdmin ? <C.SnowUpdateMediaButton
                            remoteId={remoteMetadataId}
                            kind={props.mediaKind}
                            updateMediaJob={(promptDetails) => {
                                const mediaDetails = props.getUpdateMediaJobDetails(localParams)
                                return apiClient.createJobUpdateMediaFiles({ ...promptDetails, ...mediaDetails })
                            }} /> : null}
                        <C.SnowTextButton
                            title={`Toggle Player [${player}]`}
                            onPress={togglePlayer}
                        />
                        <C.SnowTextButton
                            title="Info"
                            onPress={showInfo}
                        />
                    </C.SnowGrid>
                </C.View>
                <C.View>
                    {versionPicker}
                    {extraPicker}
                    <C.SnowTrackSelector
                        tracks={videoFile.info.tracks}
                        selectTrack={selectTrack}
                        audioTrack={audioTrack}
                        subtitleTrack={subtitleTrack}
                    />
                </C.View>
                <C.View>
                    <C.SnowText>Path: {videoFile.network_path}</C.SnowText>
                    <C.SnowText>Overall Quality: {C.util.bitsToPretty(videoFile.info.size_bits)}</C.SnowText>
                    <C.SnowText>Video: {C.util.bitsToPretty(videoTrack.bit_rate)} {videoTrack.is_hdr ? 'HDR' : 'SDR'}</C.SnowText>
                    <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                </C.View>
            </C.FillView>
        )
    }
    return (
        <C.SnowText>
            Loading {props.mediaKind} {localParams.movieId ? localParams.movieId : localParams.episodeId}.
        </C.SnowText>
    );
}
