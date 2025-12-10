class Config {
    constructor() {
        this.vondoomWebApiUrl = 'http://192.168.101.10:8000' // Desktop
        this.stormWebApiUrl = 'http://192.168.101.30:8000' // Laptop
        this.beastWebApiUrl = 'http://beast.9914.us:9063' // Prod

        this.clientVersion = "1.4.16"
        this.clientBuildDate = "December 07, 2025"
        this.clientDevBuildNumber = 1

        this.debounceMilliseconds = 700
        this.progressMinDeltaSeconds = 5

        this.debugVideoPlayer = true

        const animeUrl = "/auth/wrap/details/episode?shelfId=2&showId=54&seasonId=112&episodeId=2377&showName=Gintama&seasonOrder=2&episodeOrder=3"
        const movieUrl = "/auth/wrap/details/movie?shelfId=1&movieId=651"
        const showUrl = '/auth/wrap/details/episode?shelfId=2&showId=243&seasonId=563&episodeId=10312&showName=Blue%27s%20Clues&seasonOrder=1&episodeOrder=2'
        const whiteLetterBoxUrl = '/auth/wrap/details/movie?shelfId=1&movieId=971'
        const h264TenBit = '/auth/wrap/details/episode?shelfId=2&showId=528&seasonId=1896&episodeId=33534&showName=Star ☆ Twinkle Precure&seasonOrder=1&episodeOrder=7'
        const h265TenBitHDR = '/auth/wrap/details/movie?shelfId=1&movieId=390'
        const cartoonUrl = '/auth/wrap/details/episode?shelfId=2&showId=228&seasonId=478&episodeId=8827&showName=Aaahh%21%21%21%20Real%20Monsters&seasonOrder=1&episodeOrder=2'

        const seekUrl = '/auth/wrap/details/episode?shelfId=2&showId=428&seasonId=1408&episodeId=26468&showName=H2O+-+Just+Add+Water&seasonOrder=1&episodeOrder=3'

        this.debugVideoUrl = seekUrl
        this.debugSnowui = false
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning