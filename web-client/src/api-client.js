import axios from "axios";
import config from "./settings";

export class ApiClient {
  constructor() {
    this.httpClient = axios.create({
      baseURL: config.webApiUrl + "/api",
    });

    this.authToken = localStorage.getItem("snowstream-auth-token");
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

  isAuthenticated() {
    return this.authToken !== null;
  }

  login(payload) {
    this.post("/login", {
      username: payload.username,
      password: payload.password,
    }).then((data) => {
      console.log({ data });
      if (data.access_token) {
        this.authToken = data.access_token;
        localStorage.setItem("snowstream-auth-token", this.authToken);
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
