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

        this.clientVersion = "0.9.6"
        this.clientBuildDate = "June 09, 2025"
        this.useNullVideoView = false
        this.debugVideoView = false
        console.log('[DEBUG] Using the web api URL: ' + this.webApiUrl)
    }
}

export const config = new Config()


export function QuietReactWarning() {
    return null
}

export default QuietReactWarning