import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { saveSession } from "../api";
import { IconAlert, IconCheck } from "../components/Icons";

const FEATURES = [
  "Real password hashing and server-issued session tokens",
  "Per-document sharing with access enforced on the server",
  "Rich-text editing that autosaves as you type",
];

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const { data } = await api.post(endpoint, { username, password });
      saveSession(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-showcase">
        <div className="auth-showcase-content">
          <span className="brand">
            <span className="brand-mark">C</span>
            CollabDocs
          </span>
          <h2>Write together, without losing track of who's writing what.</h2>
          <p>
            A small, focused document editor built for shared drafts — real accounts, real
            access control, and a page that's always saved.
          </p>
          <ul className="showcase-list">
            {FEATURES.map((f) => (
              <li key={f}>
                <IconCheck className="tick" width={16} height={16} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="auth-showcase-foot">collabdocs · document workspace</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <span className="brand">
            <span className="brand-mark">C</span>
            CollabDocs
          </span>
          <h1>{mode === "login" ? "Welcome back" : "Create an account"}</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "Log in to your documents" : "Start writing in under a minute"}
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && (
              <div className="auth-error">
                <IconAlert width={15} height={15} />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <button
            className="link-button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>

          <div className="demo-hint">
            <strong>Demo accounts</strong> (password: <code>password123</code>): alice, bob, carol
          </div>
        </div>
      </div>
    </div>
  );
}
