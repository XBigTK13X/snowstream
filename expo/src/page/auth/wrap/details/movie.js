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
            return navPush({
                path: routes.movieList,
                params: { shelfId: routeParams.shelfId }
            })
        }}
        getPlayRoute={(routes) => {
            return routes.moviePlay
        }}
        getPlayParameters={(routeParams) => {
            return {
                movieId: routeParams.movieId
            }
        }}
        getJobTarget={(routeParams) => {
            return {
                targetKind: 'movie',
                targetId: routeParams.movieId
            }
        }}
    />
}
