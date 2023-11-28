import axios from "axios";
import config from "./settings";

export class ApiClient {
  constructor() {
    this.createClient();

    this.get = async (url) => {
      return this.httpClient.get(url).then((response) => {
        return response.data;
      });
    };

    this.post = async (url, payload) => {
      return this.httpClient.post(url, payload).then((response) => {
        return response.data;
      });
    };
  }

  createClient() {
    this.httpClient = axios.create({
      baseURL: config.webApiUrl + "/api",
    });

    this.authToken = localStorage.getItem("snowstream-auth-token");

    if (this.authToken) {
      console.log("Using authed client");
      this.httpClient = axios.create({
        baseURL: config.webApiUrl + "/api",
        headers: {
          Authorization: "Bearer " + this.authToken,
        },
      });
    }
  }

  isAuthenticated() {
    return this.authToken !== null;
  }

  login(payload) {
    return this.httpClient
      .postForm("/login", {
        username: payload.username,
        password: payload.password,
      })
      .then((data) => {
        if (data && data.data && data.data.access_token) {
          this.authToken = data.data.access_token;
          localStorage.setItem("snowstream-auth-token", this.authToken);
          this.createClient();
        }
        return true;
      });
  }

  logout() {
    localStorage.removeItem("snowstream-auth-token");
    this.authToken = null;
  }

  getStreamSources() {
    return this.get("/stream/source/list");
  }

  scheduleStreamSourcesRefresh() {
    return this.post("/job", { name: "stream_sources_refresh" });
  }

  createStreamSource(payload) {
    return this.post("/stream/source", {
      url: payload.url,
      username: payload.username,
      password: payload.password,
      kind: payload.kind,
      name: payload.name,
    });
  }

  getShelves() {
    return this.get("/shelf/list");
  }

  createShelf(payload) {
    return this.post("/shelf", {
      name: payload.name,
      kind: payload.kind,
      directory: payload.directory,
    });
  }

  scheduleShelvesScan() {
    return this.post("/job", { name: "scan_shelves_content" });
  }
}
