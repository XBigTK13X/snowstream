import React from "react";
import { useContext } from "react";
import { ApiClientContext } from "../contexts";

class ContextualizedAdminPage extends React.Component {
  constructor(props) {
    super(props);

    this.apiClient = this.props.apiClient;

    this.state = {
      kind: "IptvM3u",
      streamSources: [],
      url: null,
      username: null,
      password: null,
      name: null,
    };

    this.changeForm = this.changeForm.bind(this);
    this.scheduleRefresh = this.scheduleRefresh.bind(this);
    this.createStreamSource = this.createStreamSource.bind(this);
  }

  componentDidMount() {
    this.apiClient.getStreamSources().then((streamSources) => {
      this.setState({
        streamSources,
      });
    });
  }

  scheduleRefresh() {
    this.apiClient.scheduleStreamSourcesRefresh();
  }

  createStreamSource() {
    this.apiClient.createStreamSource();
  }

  changeForm(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }

  render() {
    let streamSourcesMarkup = null;
    if (this.state.streamSources) {
      streamSourcesMarkup = (
        <div>
          <ul>
            {this.state.streamSources.map((streamSource) => {
              return (
                <div key={streamSource.id}>
                  <li>{streamSource.name}</li>
                </div>
              );
            })}
          </ul>
          <button
            onClick={this.scheduleRefresh}
            id="action-stream-sources-refresh"
            className="action-button"
          >
            Schedule Refresh
          </button>
        </div>
      );
    }
    return (
      <div>
        Create a new Stream Source
        <div>
          <label htmlFor="kind">Kind</label>
          <select
            value={this.state.kind}
            onChange={this.changeForm}
            className="edit-dropdown"
            id="kind"
            name="kind"
          >
            <option value="IptvM3u">IPTV Channels M3U</option>
            <option value="IptvEpg">IPTV EPG XML</option>
            <option value="SchedulesDirect">Schedules Direct</option>
            <option value="HdHomeRun">HDHomeRun</option>
            <option value="FrigateNvr">Frigate NVR</option>
          </select>
          <label htmlFor="url">URL</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="url"
            name="url"
          />
          <label htmlFor="name">Name</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="name"
            name="name"
          />
          <label htmlFor="username">Username</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="username"
            name="username"
          />
          <label htmlFor="password">Password</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="password"
            name="password"
          />
          <button
            onClick={this.createStreamSource}
            id="action-stream-source-create"
            className="action-button"
          >
            Create
          </button>
        </div>
        {streamSourcesMarkup}
      </div>
    );
  }
}

export function AdminPage() {
  let apiClient = useContext(ApiClientContext);

  return (
    <ContextualizedAdminPage apiClient={apiClient}></ContextualizedAdminPage>
  );
}

export default AdminPage;
