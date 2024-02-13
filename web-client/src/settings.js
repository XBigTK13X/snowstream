class Config {
  constructor() {
    // This makes token swapping environment variables at runtime from the server easier to handle
    try {
      // eslint-disable-next-line no-undef
      this.webApiUrl = SNOWSTREAM_WEB_API_URL;
      this.clientVersion = "1.0.0";
      this.clientBuildDate = "September 18, 2023";
      console.log("[DEBUG] Using the prod web api URL: " + this.webApiUrl);
    } catch {
      this.webApiUrl = "http://localhost:8000";
      console.log("[DEBUG] Using the dev web api URL: " + this.webApiUrl);
    }
  }
}

const config = new Config();

export default config;
