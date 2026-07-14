import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TopNav from "../components/TopNav";
import { IconFile, IconAlert } from "../components/Icons";

export default function Import() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a .txt or .md file first.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/documents/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/documents/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Import failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-shell">
      <TopNav breadcrumb="Import" />

      <div className="editor-page">
        <span className="eyebrow" style={{ display: "block" }}>
          Import
        </span>
        <h1 style={{ fontSize: "1.6rem", marginTop: "0.25rem" }}>Bring in a file</h1>

        <div className="import-hint-card">
          Only <code>.txt</code> and <code>.md</code> files are supported (max 2MB). Headings
          (<code># </code>, <code>## </code>) and bullet lists (<code>- </code>) are recognized as
          formatting; everything else imports as plain paragraphs.
        </div>

        <form onSubmit={handleSubmit}>
          <label className="dropzone" htmlFor="import-file-input">
            <IconFile width={30} height={30} />
            <span style={{ fontWeight: 600 }}>{file ? file.name : "Choose a file to import"}</span>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB` : ".txt or .md — becomes a new document"}
            </span>
          </label>
          <input
            id="import-file-input"
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={(e) => setFile(e.target.files[0] || null)}
            style={{ display: "none" }}
          />

          {error && (
            <div className="banner banner-error" style={{ margin: "1rem 0" }}>
              <IconAlert width={15} height={15} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={uploading} style={{ marginTop: "1rem" }}>
            {uploading ? "Importing…" : "Import file"}
          </button>
        </form>
      </div>
    </div>
  );
}
