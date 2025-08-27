class Config {
    constructor() {
        this.vondoomWebApiUrl = 'http://192.168.101.10:8000' // Desktop
        this.stormWebApiUrl = 'http://192.168.101.30:8000' // Laptop
        this.beastWebApiUrl = 'http://beast.9914.us:9063' // Prod

        this.clientVersion = "0.15.9"
        this.clientBuildDate = "August 26, 2025"
        this.clientDevBuildNumber = 1

        this.debounceMilliseconds = 700
        this.progressMinDeltaSeconds = 5

        this.debugVideoPlayer = false

        const animeUrl = "/auth/details/episode?shelfId=2&showId=54&seasonId=112&episodeId=2377&showName=Gintama&seasonOrder=2&episodeOrder=3"
        const movieUrl = "/auth/details/movie?shelfId=1&movieId=651"
        const showUrl = '/auth/details/episode?shelfId=2&showId=243&seasonId=563&episodeId=10312&showName=Blue%27s%20Clues&seasonOrder=1&episodeOrder=2'
        const whiteLetterBoxUrl = '/auth/details/movie?shelfId=1&movieId=971'

        this.debugVideoUrl = null
        this.debugVideoUrl = whiteLetterBoxUrl
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning