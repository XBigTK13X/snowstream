import MediaTracksPage from './media-tracks'

export default function MovieDetailsPage() {

    return <MediaTracksPage
        mediaKind="Movie"
        loadMedia={(apiClient, routeParams, deviceProfile) => {
            return apiClient.getMovie(routeParams.movieId, deviceProfile)
        }}
        toggleWatchStatus={(apiClient, routeParams) => {
            return apiClient.toggleMovieWatchStatus(routeParams.movieId)
        }}
        gotoShelf={(routes, navPush, routeParams) => {
            return navPush(routes.movieList, { shelfId: routeParams.shelfId }, true)
        }}
        getPlayRoute={(routes) => {
            return routes.moviePlay
        }}
        getPlayParameters={(routeParams) => {
            return {
                movieId: routeParams.movieId
            }
        }}
        getScanDetails={(routeParams) => {
            return {
                targetKind: 'movie',
                targetId: routeParams.movieId
            }
        }}
        getUpdateMediaJobDetails={(routeParams) => {
            return {
                targetKind: 'movie',
                targetId: routeParams.movieId
            }
        }}
    />
}
