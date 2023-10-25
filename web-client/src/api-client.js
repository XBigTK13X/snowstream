import axios from "axios";
import config from "./settings";

export class ApiClient {
  constructor() {
    this.httpClient = axios.create({
      baseURL: config.webApiUrl + "/api",
    });
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

  getStreamSources() {
    return this.get("/stream/source/list");
  }

  scheduleStreamSourcesRefresh() {
    return this.post("/job", { name: "stream-sources-refresh" });
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
    return this.post("/job", { name: "scan-shelves-content" });
  }
}
