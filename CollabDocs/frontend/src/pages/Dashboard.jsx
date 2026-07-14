import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { clearSession } from "../api";
import TopNav from "../components/TopNav";
import ConfirmDialog from "../components/ConfirmDialog";
import { AvatarStack } from "../components/Avatar";
import { IconPlus, IconUpload, IconAlert, IconTrash } from "../components/Icons";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/documents");
      setDocuments(data);
    } catch (err) {
      if (err.response?.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }
      setError("Couldn't load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const { data } = await api.post("/documents", { title: "Untitled Document" });
      navigate(`/documents/${data.id}`);
    } catch (err) {
      setError("Couldn't create a new document.");
      setCreating(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/documents/${deleteTarget.id}`);
      setDocuments((docs) => docs.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError("Couldn't delete this document. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const owned = documents.filter((d) => d.is_owner);
  const shared = documents.filter((d) => !d.is_owner);

  return (
    <div className="page-shell">
      <TopNav />

      <div className="dashboard">
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">Workspace</span>
            <h1>Your documents</h1>
          </div>
          <div className="dashboard-toolbar">
            <Link to="/import" className="secondary-button">
              <IconUpload width={15} height={15} />
              Import file
            </Link>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              <IconPlus width={15} height={15} />
              {creating ? "Creating…" : "New document"}
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-value">{owned.length}</span>
            <span className="stat-label">Owned by you</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{shared.length}</span>
            <span className="stat-label">Shared with you</span>
          </div>
        </div>

        {error && (
          <div className="banner banner-error">
            <IconAlert width={15} height={15} />
            {error}
          </div>
        )}

        {loading ? (
          <p className="muted">Loading documents…</p>
        ) : (
          <>
            <section>
              <div className="section-heading">
                <h2>My Documents</h2>
                <span className="count-pill">{owned.length}</span>
              </div>
              {owned.length === 0 ? (
                <div className="empty-state">
                  You don't have any documents yet. Create one to get started.
                </div>
              ) : (
                <DocGrid docs={owned} onDeleteRequest={setDeleteTarget} />
              )}
            </section>

            <section>
              <div className="section-heading">
                <h2>Shared with me</h2>
                <span className="count-pill">{shared.length}</span>
              </div>
              {shared.length === 0 ? (
                <div className="empty-state">No documents have been shared with you yet.</div>
              ) : (
                <DocGrid docs={shared} />
              )}
            </section>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this document?"
        message={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently deleted, including access for anyone it's shared with. This can't be undone.`
            : ""
        }
        confirmLabel="Delete document"
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DocGrid({ docs, onDeleteRequest }) {
  return (
    <ul className="doc-grid">
      {docs.map((doc) => {
        const people = doc.is_owner
          ? doc.shared_with
          : [doc.owner_username, ...doc.shared_with.filter((u) => u !== doc.owner_username)];
        return (
          <li key={doc.id}>
            <Link to={`/documents/${doc.id}`} className="doc-card">
              {onDeleteRequest && (
                <button
                  type="button"
                  className="icon-button doc-card-delete"
                  title="Delete document"
                  aria-label={`Delete ${doc.title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteRequest(doc);
                  }}
                >
                  <IconTrash width={15} height={15} />
                </button>
              )}
              <span className="doc-title">{doc.title}</span>
              <span className="doc-card-footer">
                {people.length > 0 ? (
                  <AvatarStack names={people} size={24} />
                ) : (
                  <span className="doc-meta">Just you</span>
                )}
                <span className="doc-meta">{new Date(doc.updated_at).toLocaleDateString()}</span>
              </span>
              {!doc.is_owner && <span className="owner-badge">Shared by {doc.owner_username}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
