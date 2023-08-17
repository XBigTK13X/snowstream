function AdminPage() {
  return (
    <div>
      <div>
        <input className="edit-text" type="text" id="m3u-url" />
        <button className="action-button" id="add-m3u-url">
          Add M3U
        </button>
      </div>
      <div>
        <input className="edit-text" type="text" id="epg-url" />
        <button className="action-button" id="add-epg-url">
          Add EPG
        </button>
      </div>
      <ul>
        <li>
          <div></div>
        </li>
      </ul>
    </div>
  );
}

export default AdminPage;
