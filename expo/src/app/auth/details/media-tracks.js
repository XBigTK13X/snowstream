import C from '../../../common'

export default function MediaTracksPage(props) {
    const { apiClient } = C.useAppContext();
    const { routes } = C.useAppContext();
    const localParams = C.useLocalSearchParams();

    const [shelf, setShelf] = C.React.useState(null);
    const [media, setMedia] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFileIndex, setVideoFileIndex] = C.React.useState(0)
    const [player, setPlayer] = C.React.useState(C.isWeb ? 'exo' : 'mpv')
    const [forcePlayer, setForcePlayer] = C.React.useState(null)

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
            setAudioTrack(track.relative_index)
        }
        if (track.kind === 'subtitle') {
            setSubtitleTrack(track.relative_index)
        }
    }

    const chooseVideoFile = (fileIndex) => {
        setVideoFileIndex(fileIndex)
        if (media.video_files[fileIndex].tracks.inspection.scored_tracks['audio'].length) {
            setAudioTrack(media.video_files[fileIndex].tracks.inspection.scored_tracks['audio'][0].relative_index)
        }
        if (media.video_files[fileIndex].tracks.inspection.scored_tracks['subtitle'].length) {
            setSubtitleTrack(media.video_files[fileIndex].tracks.inspection.scored_tracks['subtitle'][0].relative_index)
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
    if (shelf && media) {
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
                            return { name: ff.name, index: ff.absolute_index }
                        })}
                        onChoose={chooseVideoFile}
                        value={videoFileIndex}
                    />
                </C.View>
            )
        }
        const videoFile = media.video_files[videoFileIndex]
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
                <C.SnowText>Title: {props.getMediaName ? props.getMediaName(localParams, media) : media.name}</C.SnowText>
                <C.SnowGrid scroll={false} itemsPerRow={2} substantial>
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
                    <C.SnowAdminButton title={`Rescan ${props.mediaKind}`}
                        onPress={() => {
                            const scanDetails = props.getScanDetails(localParams)
                            return apiClient.createJobShelvesScan(scanDetails)
                        }} />
                    <C.SnowUpdateMediaButton
                        remoteId={remoteMetadataId}
                        kind={props.mediaKind}
                        updateMediaJob={(promptDetails) => {
                            const mediaDetails = props.getUpdateMediaJobDetails(localParams)
                            return apiClient.createJobUpdateMediaFiles({ ...promptDetails, ...mediaDetails })
                        }} />
                    <C.SnowTextButton
                        title={`Toggle Player [${player}]`}
                        onPress={togglePlayer}
                    />
                </C.SnowGrid>
                <C.FillView>
                    {versionPicker}
                    {extraPicker}
                    <C.SnowTrackSelector
                        tracks={videoFile.tracks.inspection.scored_tracks}
                        selectTrack={selectTrack}
                        audioTrack={audioTrack}
                        subtitleTrack={subtitleTrack}
                    />
                </C.FillView>
                <C.FillView>
                    <C.SnowText>Path: {videoFile.network_path}</C.SnowText>
                    <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                    <C.SnowText>ffprobe: {videoFile.ffprobe_pruned_json}</C.SnowText>
                </C.FillView>
            </C.FillView>
        )
    }
    return (
        <C.SnowText>
            Loading {props.mediaKind} {localParams.movieId ? localParams.movieId : localParams.episodeId}.
        </C.SnowText>
    );
}
