import { NavLink } from "react-router";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const { users, currentUser, selectUser } = useUser();

  const handleUserChange = (e) => {
    const userId = e.target.value;
    if (!userId) {
      selectUser(null);
      return;
    }
    const user = users.find((u) => u._id === userId);
    selectUser(user);
  };

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

      {/* User Selector */}
      <div className="sidebar-user-section">
        <p className="sidebar-section-label">Logged in as</p>
        <select
          className="sidebar-user-select"
          value={currentUser?._id || ""}
          onChange={handleUserChange}
          id="user-selector"
        >
          <option value="">Select user...</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </select>
        {currentUser && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-avatar">
              {currentUser.firstName[0]}
              {currentUser.lastName[0]}
            </span>
            <div>
              <p className="sidebar-user-name">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="sidebar-user-role">{currentUser.role}</p>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <p>AquaGuard v1.0</p>
      </div>
    </aside>
  );
}
