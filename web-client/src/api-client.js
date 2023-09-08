import axios from "axios";
import config from "./settings";

export class ApiClient {
  constructor() {
    this.httpClient = axios.create({
      baseURL: config.webApiUrl,
    });
    this.get = async (url) => {
      return this.httpClient.get(url).then((response) => {
        return response.data;
      });
    };
    this.put = async (url, payload) => {
      return this.httpClient.put(url, payload).then((response) => {
        return response.data;
      });
    };
  }

  getStreamSources() {
    return this.get("/stream/source/list");
  }

  scheduleStreamSourcesRefresh() {
    return this.put("/job", { name: "stream-sources-refresh" });
  }

  createStreamSource(payload) {
    return this.put("/stream/source", {
      url: payload.url,
      username: payload.username,
      password: payload.password,
      kind: payload.kind,
      name: payload.name,
    });
  }
}
