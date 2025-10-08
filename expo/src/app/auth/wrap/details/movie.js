import MediaTracksPage from './media-tracks'

export default function MovieDetailsPage() {

    return <MediaTracksPage
        mediaKind="Movie"
        loadMedia={(apiClient, localParams, deviceProfile) => {
            return apiClient.getMovie(localParams.movieId, deviceProfile)
        }}
        toggleWatchStatus={(apiClient, localParams) => {
            return apiClient.toggleMovieWatchStatus(localParams.movieId)
        }}
        gotoShelf={(routes, navPush, localParams) => {
            return navPush(routes.movieList, { shelfId: localParams.shelfId }, true)
        }}
        getPlayRoute={(routes) => {
            return routes.moviePlay
        }}
        getPlayParameters={(localParams) => {
            return {
                movieId: localParams.movieId
            }
        }}
        getScanDetails={(localParams) => {
            return {
                targetKind: 'movie',
                targetId: localParams.movieId
            }
        }}
        getUpdateMediaJobDetails={(localParams) => {
            return {
                targetKind: 'movie',
                targetId: localParams.movieId
            }
        }}
    />
}
