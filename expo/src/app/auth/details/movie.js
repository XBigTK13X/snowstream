import C from '../../../common'

import MediaTracksPage from './media-tracks'

export default function MovieDetailsPage() {

    return <MediaTracksPage
        mediaKind="Movie"
        loadMedia={(apiClient, localParams) => {
            return apiClient.getMovie(localParams.movieId)
        }}
        toggleWatchStatus={(apiClient, localParams) => {
            return apiClient.toggleMovieWatchStatus(localParams.movieId)
        }}
        gotoShelf={(routes, localParams) => {
            return routes.func(routes.movieList, { shelfId: localParams.shelfId })
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
