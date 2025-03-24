//TODO Figure out how to handle populating these values at prod runtime

class Config {
    constructor() {
        //Prod
        //this.webApiUrl = 'http://192.168.100.110:9064'

        //Laptop Dev
        //this.webApiUrl = 'http://192.168.101.30:8000'

        //Desktop Dev
        this.webApiUrl = 'http://192.168.101.10:8000'

        this.clientVersion = '0.5.7'
        this.clientBuildDate = 'November 12, 2024'
        console.log('[DEBUG] Using the web api URL: ' + this.webApiUrl)
    }
}

const config = new Config()

module.exports = config
