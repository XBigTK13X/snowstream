import React from "react";
import { useContext } from "react";
import { ApiClientContext } from "../contexts";

class MediaLibraryAdminTab extends React.Component {
  constructor(props) {
    super(props);

    this.apiClient = this.props.apiClient;

    this.state = {
      directory: null,
      name: null,
      kind: "Movies",
      shelves: null,
    };
    this.reloadShelves = this.reloadShelves.bind(this);
    this.changeForm = this.changeForm.bind(this);
    this.createShelf = this.createShelf.bind(this);
    this.scanShelvesContent = this.scanShelvesContent.bind(this);
  }
  componentDidMount() {
    this.reloadShelves();
  }
  reloadShelves() {
    this.apiClient.getShelves().then((shelves) => {
      this.setState({
        shelves,
      });
    });
  }
  changeForm(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }
  createShelf() {
    this.apiClient.createShelf(this.state).then(() => {
      this.reloadShelves();
    });
  }
  scanShelvesContent() {}
  render() {
    let shelvesMarkup = "No shelves were found. Try adding one.";
    if (this.state.shelves) {
      shelvesMarkup = (
        <div>
          <h4>Shelves</h4>
          <ul>
            {this.state.shelves.map((shelf) => {
              return (
                <div key={shelf.id}>
                  <li>
                    {shelf.name} - {shelf.kind} - {shelf.directory}
                  </li>
                </div>
              );
            })}
          </ul>
          <button
            onClick={this.scanShelvesContent}
            id="action-scan-shelves-content"
            className="action-button"
          >
            Scan Shelves Content
          </button>
        </div>
      );
    }
    return (
      <div>
        <h3>Media Shelves</h3>
        {shelvesMarkup}
        <div>
          <label htmlFor="kind">Kind</label>
          <select
            value={this.state.kind}
            onChange={this.changeForm}
            className="edit-dropdown"
            id="kind"
            name="kind"
          >
            <option value="Movies">Movies</option>
            <option value="Shows">Shows</option>
          </select>
          <label htmlFor="name">Name</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="name"
            name="name"
          />
          <label htmlFor="directory">Directory</label>
          <input
            onChange={this.changeForm}
            className="edit-text"
            type="text"
            id="directory"
            name="directory"
          />
          <button
            onClick={this.createShelf}
            id="action-create-shelf"
            className="action-button"
          >
            Create
          </button>
        </div>
      </div>
    );
  }
}

class StreamSourceAdminTab extends React.Component {
  constructor(props) {
    super(props);

    this.apiClient = this.props.apiClient;

    this.state = {
      kind: "IptvM3u",
      streamSources: null,
      url: null,
      username: null,
      password: null,
      name: null,
    };

    this.changeForm = this.changeForm.bind(this);
    this.scheduleRefresh = this.scheduleRefresh.bind(this);
    this.createStreamSource = this.createStreamSource.bind(this);
    this.reloadStreamSources = this.reloadStreamSources.bind(this);
  }

  componentDidMount() {
    this.reloadStreamSources();
  }

  scheduleRefresh() {
    this.apiClient.scheduleStreamSourcesRefresh();
  }

  reloadStreamSources() {
    this.apiClient.getStreamSources().then((streamSources) => {
      this.setState({
        streamSources,
      });
    });
  }

  createStreamSource() {
    this.apiClient.createStreamSource(this.state).then(() => {
      this.reloadStreamSources();
    });
  }

  changeForm(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }

  render() {
    let streamSourcesMarkup = "No stream sources were found. Try adding one.";
    if (this.state.streamSources) {
      streamSourcesMarkup = (
        <div>
          <h4>Stream Sources</h4>
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
        <h3>Stream Sources</h3>
        {streamSourcesMarkup}
        <h4>Create a new Stream Source</h4>
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
      </div>
    );
  }
}

class ContextualizedAdminPage extends React.Component {
  render() {
    return (
      <div>
        <MediaLibraryAdminTab apiClient={this.props.apiClient} />
        <hr />
        <StreamSourceAdminTab apiClient={this.props.apiClient} />
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
