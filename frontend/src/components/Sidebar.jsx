import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Droplet, LayoutDashboard, ListTodo, AlertTriangle, Activity, Settings, LogOut, Sun } from "lucide-react";

export const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["admin", "officer", "public"] },
    { name: "Alerts", path: "/alerts", icon: AlertTriangle, roles: ["admin", "officer"] },
    { name: "Tasks", path: "/tasks", icon: ListTodo, roles: ["admin", "officer"] },
    { name: "Auto Tasks", path: "/auto-tasks", icon: Activity, roles: ["admin"] },
    { name: "Wells & Weather", path: "/wells", icon: Sun, roles: ["admin", "officer", "public"] },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.role || "public")
  );

  return (
    <div className="w-64 h-screen border-r border-dark-border bg-dark-card flex flex-col fixed left-0 top-0 z-10 glass">
      <div className="p-6 flex items-center space-x-3 mb-6">
        <Droplet className="text-aqua h-8 w-8" />
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-aqua to-aqua-light">
          AquaGuard
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-aqua/20 text-aqua font-medium shadow-[0_0_10px_rgba(0,247,255,0.15)]"
                  : "text-gray-400 hover:bg-dark-border hover:text-gray-200"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-aquaglow" : ""}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border mt-auto">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full px-4 py-3 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};
