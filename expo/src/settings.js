class Config {
    constructor() {
        this.webApiUrl = null
        try {
            // This is only used in the web client
            // It gets token swapped in by a server environment variable
            this.webApiUrl = SNOWSTREAM_WEB_API_URL
        }
        catch {
            // These are used by the Android clients
            // They are set at compile time (for now)
            //Prod
            //this.webApiUrl = 'http://beast.9914.us:9063'

            //Laptop Dev
            //this.webApiUrl = 'http://192.168.101.30:8000'

            //Desktop Dev
            this.webApiUrl = 'http://192.168.101.10:8000'
        }

        this.clientVersion = "0.10.3"
        this.clientBuildDate = "June 12, 2025"
        this.clientDevBuildNumber = 1
        this.useNullVideoView = false
        this.debugVideoView = false
        this.debounceMilliseconds = 1000
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning