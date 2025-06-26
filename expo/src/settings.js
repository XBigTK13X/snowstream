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

        this.clientVersion = "0.11.8"
        this.clientBuildDate = "June 26, 2025"
        this.clientDevBuildNumber = 1
        this.useNullVideoView = false
        this.debugVideoView = false
        this.debounceMilliseconds = 700
        this.progressMinDeltaSeconds = 5
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning