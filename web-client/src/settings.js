class Config {
  constructor() {
    // This makes token swapping environment variables at runtime from the server easier to handle
    try {
      // eslint-disable-next-line no-undef
      this.webApiUrl = SNOWSTREAM_WEB_API_URL;
    } catch {
      this.webApiUrl = "http://localhost:8000";
    }
  }
}

const config = new Config();

export default config;
