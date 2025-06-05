import C from '../../../common'

export default function MediaTracksPage(props) {
    const { apiClient } = C.useSession();
    const { routes } = C.useSettings();
    const localParams = C.useLocalSearchParams();

    const [shelf, setShelf] = C.React.useState(null);
    const [media, setMedia] = C.React.useState(null);
    const [audioTrack, setAudioTrack] = C.React.useState(0)
    const [subtitleTrack, setSubtitleTrack] = C.React.useState(0)
    const [videoFile, setVideoFile] = C.React.useState(null)
    const [videoFileIndex, setVideoFileIndex] = C.React.useState(0)
    const [videoFileTracks, setVideoFileTracks] = C.React.useState(null)

    const shelfId = localParams.shelfId;

    C.React.useEffect(() => {
        if (!shelf) {
            apiClient.getShelf(shelfId).then((response) => {
                setShelf(response)
            })

            props.loadMedia(apiClient, localParams).then((response) => {
                setMedia(response)
                setVideoFile(response.video_files[0])
                if (response.tracks.inspection.scored_tracks['audio'].length) {
                    setAudioTrack(response.tracks.inspection.scored_tracks['audio'][0].relative_index)
                }
                if (response.tracks.inspection.scored_tracks['subtitle'].length) {
                    setSubtitleTrack(response.tracks.inspection.scored_tracks['subtitle'][0].relative_index)
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
    if (shelf && media && videoFile) {
        const watchTitle = media.watched ? "Set Status to Unwatched" : "Set Status to Watched"
        const playDestination = {
            videoFileIndex: videoFileIndex,
            audioTrack: audioTrack,
            subtitleTrack: subtitleTrack,
            shelfId: shelfId
        }
        const mediaDestination = props.getPlayDestination(localParams)
        const combinedPlayDestination = { ...playDestination, ...mediaDestination }
        return (
            <C.View>
                <C.SnowText>Title: {props.getMediaName ? props.getMediaName(localParams, media) : media.name}</C.SnowText>
                <C.SnowText>Path: {videoFile.network_path}</C.SnowText>
                <C.SnowText>Times Watched: {media.watch_count ? media.watch_count.amount : 0}</C.SnowText>
                <C.SnowGrid>
                    <C.SnowTextButton title="Play" onPress={routes.func(routes.playMedia, combinedPlayDestination)} />
                    <C.SnowTextButton title={watchTitle} onLongPress={setWatchStatus} />
                    <C.SnowTextButton title={shelf.name} onPress={props.gotoShelf(routes, localParams)} />
                    {props.getNavButtons ? props.getNavButtons(routes, localParams).map((button) => { return button }) : null}
                    <C.SnowAdminButton title={`Rescan ${props.mediaKind}`}
                        onPress={() => {
                            const scanDetails = props.getScanDetails(localParams)
                            return apiClient.createJobShelvesScan(scanDetails)
                        }} />
                    <C.SnowUpdateMediaButton
                        remoteId={media.remote_metadata_id ? media.remote_metadata_id : ''}
                        kind={props.mediaKind}
                        updateMediaJob={(details) => {
                            const mediaDetails = props.getUpdateMediaJobDetails(localParams)
                            const combinedDetails = { ...details, mediaDetails }
                            apiClient.createJobUpdateMediaFiles(combinedDetails)
                        }} />
                </C.SnowGrid>
                <C.SnowTrackSelector
                    tracks={media.tracks.inspection.scored_tracks}
                    selectTrack={selectTrack}
                    audioTrack={audioTrack}
                    subtitleTrack={subtitleTrack}
                />
            </C.View>
        )
    }
    return (
        <C.SnowText>
            Loading {props.mediaKind} {localParams.movieId ? localParams.movieId : localParams.episodeId}.
        </C.SnowText>
    );
}
