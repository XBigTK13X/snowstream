//TODO Figure out how to handle populating these values at prod runtime

class Config {
    constructor() {
        //Prod
        this.webApiUrl = 'http://192.168.1.4:9064'
        //Laptop Dev
        //this.webApiUrl = 'http://192.168.1.25:8000'
        this.clientVersion = '0.5.7'
        this.clientBuildDate = 'November 12, 2024'
        console.log('[DEBUG] Using the web api URL: ' + this.webApiUrl)
    }
}

const config = new Config()

module.exports = config
