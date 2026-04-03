import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWells: 0,
    activeWells: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    pendingTasks: 0,
    completedTasks: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [alertDistribution, setAlertDistribution] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");

  useEffect(() => {
    // Get admin info from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminInfo(user);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard statistics
      const statsRes = await axiosInstance.get("/admin/dashboard-stats");
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch recent activities
      const activitiesRes = await axiosInstance.get("/admin/recent-activities");
      if (activitiesRes.data.success) {
        setRecentActivities(activitiesRes.data.data);
      }

      // Fetch recent users
      const usersRes = await axiosInstance.get("/admin/recent-users");
      if (usersRes.data.success) {
        setRecentUsers(usersRes.data.data);
      }

      // Fetch user growth data
      const growthRes = await axiosInstance.get("/admin/user-growth");
      if (growthRes.data.success) {
        setUserGrowth(growthRes.data.data);
      }

      // Fetch alert distribution
      const alertsRes = await axiosInstance.get("/admin/alert-distribution");
      if (alertsRes.data.success) {
        setAlertDistribution(alertsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const COLORS = ["#F5BD27", "#4BDA7F", "#178B96", "#CA6162", "#A38F7A"];

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-[#101624] rounded-xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg`}
          style={{ backgroundColor: `${color}10` }}
        >
          <div style={{ color: color }}>{icon}</div>
        </div>
        {trend && (
          <span className="text-xs text-[#4BDA7F] bg-[#4BDA7F]/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-[#9BA0A6] text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#172431] last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: activity.color || "#F5BD27" }}
        ></div>
        <div>
          <p className="text-white text-sm font-medium">{activity.title}</p>
          <p className="text-[#6B7280] text-xs">{activity.time}</p>
        </div>
      </div>
      <span
        className="text-xs px-2 py-1 rounded-full"
        style={{
          backgroundColor: `${activity.statusColor || "#4BDA7F"}10`,
          color: activity.statusColor || "#4BDA7F",
        }}
      >
        {activity.status}
      </span>
    </div>
  );

  const UserItem = ({ user }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#172431] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold">
          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
        </div>
        <div>
          <p className="text-white text-sm font-medium">
            {user.name || user.fullName || "User"}
          </p>
          <p className="text-[#6B7280] text-xs">{user.email}</p>
        </div>
      </div>
      <span className="text-xs text-[#9BA0A6]">
        {user.date || user.createdAt?.split("T")[0] || "Recently"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#101624] border-r border-[#172431] transition-all duration-300 z-20 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[#172431]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#0A0E19]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                </svg>
              </div>
              {sidebarOpen && (
                <span className="text-white font-bold text-lg">AquaGuard</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#9BA0A6] hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveNav("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeNav === "dashboard"
                  ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                  : "text-[#9BA0A6] hover:bg-[#172431]"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
              {sidebarOpen && <span>Dashboard</span>}
            </button>
            <button
              onClick={() => setActiveNav("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeNav === "users"
                  ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                  : "text-[#9BA0A6] hover:bg-[#172431]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {sidebarOpen && <span>Users</span>}
            </button>
            <button
              onClick={() => setActiveNav("wells")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeNav === "wells"
                  ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                  : "text-[#9BA0A6] hover:bg-[#172431]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {sidebarOpen && <span>Wells</span>}
            </button>
            <button
              onClick={() => setActiveNav("alerts")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeNav === "alerts"
                  ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                  : "text-[#9BA0A6] hover:bg-[#172431]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {sidebarOpen && <span>Alerts</span>}
            </button>
            <button
              onClick={() => setActiveNav("tasks")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeNav === "tasks"
                  ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                  : "text-[#9BA0A6] hover:bg-[#172431]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {sidebarOpen && <span>Tasks</span>}
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#172431]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#CA6162] hover:bg-[#CA6162]/10 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-[#101624]/50 backdrop-blur-sm border-b border-[#172431] sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-[#9BA0A6] text-sm mt-1">
                  Welcome back,{" "}
                  {adminInfo?.firstName || adminInfo?.name || "Admin"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-[#172431] transition-colors">
                  <svg
                    className="w-6 h-6 text-[#9BA0A6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {stats.criticalAlerts > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#CA6162] rounded-full"></span>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold">
                    {adminInfo?.firstName?.charAt(0) ||
                      adminInfo?.name?.charAt(0) ||
                      "A"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-white text-sm font-medium">
                      {adminInfo?.firstName || adminInfo?.name || "Admin User"}
                    </p>
                    <p className="text-[#6B7280] text-xs">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#9BA0A6]">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  }
                  color="#F5BD27"
                  trend={stats.totalUsers > 0 ? "+12%" : null}
                />
                <StatCard
                  title="Active Wells"
                  value={stats.activeWells.toLocaleString()}
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M2 20h20v-4H2v4zm2-8h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM4 8h2v2H4V8zm4 0h2v2H8V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zm4 0h2v2h-2V8zM2 4v2h20V4H2z" />
                    </svg>
                  }
                  color="#4BDA7F"
                  trend={
                    stats.activeWells > 0
                      ? `+${Math.round(
                          (stats.activeWells / stats.totalWells) * 100
                        )}%`
                      : null
                  }
                />
                <StatCard
                  title="Critical Alerts"
                  value={stats.criticalAlerts.toLocaleString()}
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  }
                  color="#CA6162"
                  trend={stats.criticalAlerts > 0 ? "Urgent" : null}
                />
                <StatCard
                  title="Pending Tasks"
                  value={stats.pendingTasks.toLocaleString()}
                  icon={
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  }
                  color="#178B96"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
                  <h3 className="text-white font-semibold mb-4">User Growth</h3>
                  {userGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#172431" />
                        <XAxis dataKey="month" stroke="#9BA0A6" />
                        <YAxis stroke="#9BA0A6" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#101624",
                            border: "1px solid #172431",
                            borderRadius: "8px",
                            color: "#FFFFFF",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#F5BD27"
                          strokeWidth={2}
                          dot={{ fill: "#F5BD27", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-[#6B7280]">
                      No data available
                    </div>
                  )}
                </div>

                {/* Alert Distribution Chart */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
                  <h3 className="text-white font-semibold mb-4">
                    Alert Distribution
                  </h3>
                  {alertDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={alertDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {alertDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#101624",
                            border: "1px solid #172431",
                            borderRadius: "8px",
                            color: "#FFFFFF",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-[#6B7280]">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity & Users */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">
                      Recent Activities
                    </h3>
                    <button className="text-[#F5BD27] text-sm hover:text-[#E6C27A] transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                      ))
                    ) : (
                      <div className="text-center text-[#6B7280] py-8">
                        No recent activities
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Recent Users</h3>
                    <button className="text-[#F5BD27] text-sm hover:text-[#E6C27A] transition-colors">
                      View All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user, index) => (
                        <UserItem key={index} user={user} />
                      ))
                    ) : (
                      <div className="text-center text-[#6B7280] py-8">
                        No recent users
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #172431;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f5bd27;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e6c27a;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
