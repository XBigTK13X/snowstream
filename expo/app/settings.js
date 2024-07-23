//TODO Figure out how to handle populating these values at prod runtime

class Config {
    constructor() {
        this.webApiUrl = "http://192.168.1.20:8000";
        this.clientVersion = "0.5.2";
        this.clientBuildDate = "July 22, 2024";
        console.log("[DEBUG] Using the web api URL: " + this.webApiUrl);
    }
}

const config = new Config();

module.exports = config;
