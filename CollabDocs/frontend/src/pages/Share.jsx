import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import TopNav from "../components/TopNav";
import Avatar from "../components/Avatar";
import { IconAlert, IconCheck, IconTrash } from "../components/Icons";

export default function Share() {
  const { docId } = useParams();
  const [doc, setDoc] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  async function loadData() {
    setError("");
    try {
      const [docResp, usersResp] = await Promise.all([
        api.get(`/documents/${docId}`),
        api.get("/auth/users"),
      ]);
      setDoc(docResp.data);
      setAllUsers(usersResp.data);
    } catch (err) {
      setError("Couldn't load sharing details for this document.");
    }
  }

  const shareable = allUsers.filter((u) => !doc?.shared_with.includes(u.username));

  async function handleShare(e) {
    e.preventDefault();
    if (!selectedUsername) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post(`/documents/${docId}/share`, { username: selectedUsername });
      setDoc(data);
      setSuccess(`Shared with ${selectedUsername}.`);
      setSelectedUsername("");
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't share the document.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(username) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.delete(`/documents/${docId}/share/${username}`);
      setDoc(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't remove access.");
    } finally {
      setBusy(false);
    }
  }

  if (error && !doc) {
    return (
      <div className="page-shell">
        <TopNav breadcrumb="Sharing" />
        <div className="editor-page">
          <div className="banner banner-error">
            <IconAlert width={15} height={15} />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!doc)
    return (
      <div className="page-shell">
        <TopNav breadcrumb="Sharing" />
        <div className="editor-page">
          <p className="muted">Loading…</p>
        </div>
      </div>
    );

  return (
    <div className="page-shell">
      <TopNav breadcrumb={`Sharing · ${doc.title}`} />

      <div className="editor-page">
        <span className="eyebrow" style={{ display: "block" }}>
          Sharing
        </span>
        <h1 style={{ fontSize: "1.5rem", marginTop: "0.25rem" }}>{doc.title}</h1>

        <div className="card-section">
          <h3>People with access</h3>
          <ul className="people-list">
            <li className="person-row">
              <Avatar name={doc.owner_username} size={32} />
              <div className="person-info">
                <span className="person-name">{doc.owner_username}</span>
                <span className="person-role">Owner</span>
              </div>
            </li>
            {doc.shared_with.map((username) => (
              <li key={username} className="person-row">
                <Avatar name={username} size={32} />
                <div className="person-info">
                  <span className="person-name">{username}</span>
                  <span className="person-role">Can view &amp; edit</span>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => handleRevoke(username)}
                >
                  <IconTrash width={14} height={14} />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-section">
          <h3>Add someone</h3>
          {shareable.length === 0 ? (
            <p className="muted">Everyone already has access to this document.</p>
          ) : (
            <form onSubmit={handleShare} className="import-form">
              <select value={selectedUsername} onChange={(e) => setSelectedUsername(e.target.value)}>
                <option value="">Choose a user…</option>
                {shareable.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary" disabled={busy || !selectedUsername}>
                {busy ? "Sharing…" : "Grant access"}
              </button>
            </form>
          )}
          {error && (
            <div className="banner banner-error" style={{ marginTop: "0.75rem" }}>
              <IconAlert width={15} height={15} />
              {error}
            </div>
          )}
          {success && (
            <div className="banner banner-success" style={{ marginTop: "0.75rem" }}>
              <IconCheck width={15} height={15} />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
