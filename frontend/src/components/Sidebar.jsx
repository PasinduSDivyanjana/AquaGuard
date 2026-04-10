import { NavLink } from "react-router";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          <span className="brand-icon">💧</span>
          AquaGuard
        </h1>
        <p>Well Monitoring System</p>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-section-label">Menu</p>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="link-icon">📊</span>
          Dashboard
        </NavLink>

        <NavLink
          to="/create"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <span className="link-icon">📝</span>
          Create Report
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>AquaGuard v1.0</p>
      </div>
    </aside>
  );
}
