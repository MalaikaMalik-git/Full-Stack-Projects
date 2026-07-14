import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { IconLogout } from "./Icons";
import { clearSession, getCurrentUser } from "../api";

// Persistent app shell nav. The brand mark is the "back" affordance —
// click it to return to the dashboard from anywhere. An optional
// breadcrumb shows page context (e.g. the document title) without
// needing a dedicated back button.
export default function TopNav({ breadcrumb, right }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <nav className="topnav">
      <div className="topnav-left">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          CollabDocs
        </Link>
        {breadcrumb && (
          <div className="topnav-breadcrumb">
            <span className="topnav-sep">/</span>
            <span>{breadcrumb}</span>
          </div>
        )}
      </div>
      <div className="header-actions">
        {right}
        <span className="current-user">
          <Avatar name={user?.username} size={26} />
          {user?.username}
        </span>
        <button onClick={handleLogout} className="secondary-button">
          <IconLogout width={15} height={15} />
          Log out
        </button>
      </div>
    </nav>
  );
}
