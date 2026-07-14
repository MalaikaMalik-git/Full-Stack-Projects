import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";
import RichTextEditor from "../components/RichTextEditor";
import TopNav from "../components/TopNav";
import ConfirmDialog from "../components/ConfirmDialog";
import { AvatarStack } from "../components/Avatar";
import { IconShare, IconCheck, IconAlert, IconTrash } from "../components/Icons";

const SAVE_DEBOUNCE_MS = 800;

export default function Editor() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    loadDocument();
    return () => clearTimeout(saveTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  async function loadDocument() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/documents/${docId}`);
      setDoc(data);
      setTitle(data.title);
    } catch (err) {
      if (err.response?.status === 404) setError("This document doesn't exist.");
      else if (err.response?.status === 403) setError("You don't have access to this document.");
      else setError("Couldn't load this document.");
    } finally {
      setLoading(false);
    }
  }

  const scheduleSave = useCallback(
    (updates) => {
      setSaveState("saving");
      clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          await api.put(`/documents/${docId}`, updates);
          setSaveState("saved");
        } catch (err) {
          setSaveState("error");
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [docId]
  );

  function handleTitleChange(e) {
    const value = e.target.value;
    setTitle(value);
    scheduleSave({ title: value });
  }

  function handleContentChange(html) {
    scheduleSave({ content: html });
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    try {
      await api.delete(`/documents/${docId}`);
      navigate("/");
    } catch (err) {
      setError("Couldn't delete this document. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading)
    return (
      <div className="page-shell">
        <TopNav />
        <div className="editor-page">
          <p className="muted">Loading…</p>
        </div>
      </div>
    );

  if (error) {
    return (
      <div className="page-shell">
        <TopNav />
        <div className="editor-page">
          <div className="banner banner-error">
            <IconAlert width={15} height={15} />
            {error}
          </div>
        </div>
      </div>
    );
  }

  const collaborators = doc.is_owner
    ? doc.shared_with
    : [doc.owner_username, ...doc.shared_with.filter((u) => u !== doc.owner_username)];

  return (
    <div className="page-shell">
      <TopNav breadcrumb={doc.title || "Untitled Document"} />

      <div className="editor-page">
        <div className="editor-header">
          <input
            className="title-input"
            value={title}
            onChange={handleTitleChange}
            disabled={!doc.is_owner}
          />
          {collaborators.length > 0 && <AvatarStack names={collaborators} size={26} />}
          <div className="editor-status">
            {saveState === "saving" && <span className="muted">Saving…</span>}
            {saveState === "saved" && (
              <span className="saved-indicator">
                <IconCheck width={13} height={13} />
                Saved
              </span>
            )}
            {saveState === "error" && (
              <span className="error-indicator">
                <IconAlert width={13} height={13} />
                Couldn't save
              </span>
            )}
          </div>
          {doc.is_owner && (
            <>
              <button
                type="button"
                className="icon-button danger"
                title="Delete document"
                aria-label="Delete document"
                onClick={() => setConfirmDelete(true)}
              >
                <IconTrash width={16} height={16} />
              </button>
              <Link to={`/documents/${docId}/share`} className="secondary-button">
                <IconShare width={15} height={15} />
                Share
              </Link>
            </>
          )}
        </div>

        {!doc.is_owner && (
          <p className="muted shared-banner">
            Shared by {doc.owner_username} — you can view and edit this document.
          </p>
        )}

        <RichTextEditor content={doc.content} onUpdate={handleContentChange} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this document?"
        message={`"${title || "Untitled Document"}" will be permanently deleted, including access for anyone it's shared with. This can't be undone.`}
        confirmLabel="Delete document"
        busy={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
