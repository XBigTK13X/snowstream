//TODO Figure out how to handle populating these values at prod runtime

class Config {
    constructor() {
        // This makes token swapping environment variables at runtime from the server easier to handle
        try {
            // eslint-disable-next-line no-undef
            this.webApiUrl = "http://192.168.1.25:8000";
            this.clientVersion = "0.5.0";
            this.clientBuildDate = "February 12, 2024";
            console.log("[DEBUG] Using the prod web api URL: " + this.webApiUrl);
        } catch {
            this.webApiUrl = "http://localhost:8000";
            console.log("[DEBUG] Using the dev web api URL: " + this.webApiUrl);
        }
    }
}

const config = new Config();

export default config;
