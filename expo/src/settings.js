class Config {
    constructor() {
        this.webApiUrl = null
        this.vondoomWebApiUrl = 'http://192.168.101.10:8000' //Desktop
        this.beastWebApiUrl = 'http://beast.9914.us:9063' //Prod
        try {
            // This is only used in the web client
            // It gets token swapped in by a server environment variable
            this.webApiUrl = SNOWSTREAM_WEB_API_URL
        }
        catch {
            // This is used by the Android clients
            // This is the default value, set at compile time
            this.webApiUrl = this.beastWebApiUrl
        }

        this.clientVersion = "0.11.12"
        this.clientBuildDate = "July 04, 2025"
        this.clientDevBuildNumber = 1
        this.useNullVideoView = false
        this.debugVideoPlayer = false
        this.debounceMilliseconds = 700
        this.progressMinDeltaSeconds = 5
        this.debugVideoUrl = null;
        const animeUrl = "/auth/details/episode?shelfId=2&showId=54&seasonId=112&episodeId=2377&showName=Gintama&seasonOrder=2&episodeOrder=3"
        const movieUrl = "/auth/details/movie?shelfId=1&movieId=651"
        //this.debugVideoUrl = animeUrl
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning