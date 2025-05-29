class Config {
    constructor() {
        this.webApiUrl = null
        try {
            this.webApiUrl = SNOWSTREAM_WEB_API_URL
        }
        catch {
            //Prod
            //this.webApiUrl = 'http://192.168.100.110:9064'

            //Laptop Dev
            //this.webApiUrl = 'http://192.168.101.30:8000'

            //Desktop Dev
            this.webApiUrl = 'http://192.168.101.10:8000'
        }

        this.clientVersion = "0.9.2"
        this.clientBuildDate = "May 29, 2025"
        this.useNullVideoView = false
        this.debugVideoView = false
        console.log('[DEBUG] Using the web api URL: ' + this.webApiUrl)
    }
}

const config = new Config()

module.exports = config
