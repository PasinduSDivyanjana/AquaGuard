import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import AddWell from "../components/AddWell";
import { fetchReports } from "../api/reportApi";
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
  const [settingsSubTab, setSettingsSubTab] = useState("details");

  // MAINTENANCE STATE
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSubTab, setMaintenanceSubTab] = useState("tasks");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assignedTo: "", well: "" });
  const [autoTasks, setAutoTasks] = useState([]);
  const [autoTasksLoading, setAutoTasksLoading] = useState(false);
  const [maintenanceUsers, setMaintenanceUsers] = useState([]);
  const [maintenanceWells, setMaintenanceWells] = useState([]);
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // NOTIFICATION STATE
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // REPORTS STATE
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // FETCH ALL REPORTS (admin)
  const fetchAllReports = async () => {
    try {
      setReportsLoading(true);
      const query = {};
      if (filterStatus) query.status = filterStatus;
      if (filterCondition) query.conditionType = filterCondition;
      const res = await fetchReports(query);
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch reports when reports nav is active or filters change
  useEffect(() => {
    if (activeNav === "reports") {
      fetchAllReports();
    }
  }, [activeNav, filterStatus, filterCondition]);

  // USERS STATE
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [viewUserPanel, setViewUserPanel] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds the user object to delete
  const [addUserForm, setAddUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    nic: "",
    mobile: "",
    address: "",
    gender: "Male",
    dob: "",
    role: "User",
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  // WELLS STATE
  const [allWells, setAllWells] = useState([]);
  const [wellsLoading, setWellsLoading] = useState(false);
  const [wellSearch, setWellSearch] = useState("");
  const [wellStatus, setWellStatus] = useState("");
  const [wellPage, setWellPage] = useState(1);
  const [wellTotalPages, setWellTotalPages] = useState(1);
  const [wellTotal, setWellTotal] = useState(0);
  const [selectedWell, setSelectedWell] = useState(null);
  const [showAddWellModal, setShowAddWellModal] = useState(false);
  const WELL_STATUS_OPTIONS = ["Good", "Needs Repair", "Contaminated", "Dry"];
  const WELL_STATUS_STYLES = {
    Good: { bg: "#4BDA7F", label: "Good" },
    "Needs Repair": { bg: "#F5BD27", label: "Needs Repair" },
    Contaminated: { bg: "#CA6162", label: "Contaminated" },
    Dry: { bg: "#6B7280", label: "Dry" },
  };

  // Form states for updating details (same as UserDashboard)
  const [updateForm, setUpdateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
  });

  // Form states for password change (same as UserDashboard)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await axiosInstance.get("/user");
      const users = res.data.data || res.data;
      setAllUsers(users);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  // ADMIN ADD USER
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError("");
    setAddUserLoading(true);
    try {
      await axiosInstance.post("/user/admin/create", addUserForm);
      toast.success("User created successfully!");
      setShowAddUserModal(false);
      setAddUserForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        nic: "",
        mobile: "",
        address: "",
        gender: "Male",
        dob: "",
        role: "User",
      });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create user";
      setAddUserError(msg);
      toast.error(msg);
    } finally {
      setAddUserLoading(false);
    }
  };

  // FETCH ALL WELLS (admin)
  const fetchAllWells = async (page = 1, search = "", status = "") => {
    try {
      setWellsLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await axiosInstance.get(`/wells/admin/all?${params}`);
      const d = res.data.data;
      setAllWells(d.wells);
      setWellTotal(d.total);
      setWellTotalPages(d.totalPages);
      setWellPage(d.page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch wells");
    } finally {
      setWellsLoading(false);
    }
  };

  // DELETE USER
  const handleDelete = (user) => {
    setDeleteConfirm(user); // open confirmation modal
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axiosInstance.delete(`/user/${deleteConfirm._id}`);
      toast.success(`${deleteConfirm.firstName} deleted successfully`);
      setAllUsers((prev) => prev.filter((u) => u._id !== deleteConfirm._id));
      if (viewUserPanel?._id === deleteConfirm._id) setViewUserPanel(null);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // UPDATE USER ROLE
  const handleRoleChange = async (id, newRole) => {
    try {
      await axiosInstance.put(`/user/${id}`, { role: newRole });
      toast.success("Role updated successfully");
      setAllUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  // FILTER USERS
  const filteredUsers = allUsers.filter((user) =>
    `${user.firstName || ""} ${user.lastName || ""} ${user.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    // Get admin info from localStorage first (for immediate display)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setAdminInfo(user);

    // Fetch full profile from API to get all fields (mobile, address, etc.)
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        const profileData = res.data.data;
        if (profileData) {
          setAdminInfo(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
          setUpdateForm({
            firstName: profileData.firstName || profileData.name || "",
            lastName: profileData.lastName || "",
            email: profileData.email || "",
            mobile: profileData.mobile || "",
            address: profileData.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fall back to localStorage data
        if (user) {
          setUpdateForm({
            firstName: user.firstName || user.name || "",
            lastName: user.lastName || "",
            email: user.email || "",
            mobile: user.mobile || "",
            address: user.address || "",
          });
        }
      }
    };

    fetchProfile();
    fetchDashboardData();
    fetchNotifications();
  }, []);

  // Fetch notifications (alerts)
  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/alerts");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await axiosInstance.put(`/alerts/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleNotifClick = (notif) => {
    handleMarkNotifRead(notif._id);
    setShowNotifDropdown(false);
    setActiveNav("maintenance");
    setMaintenanceSubTab("predictions");
  };

  // MAINTENANCE FETCH FUNCTIONS
  const fetchMaintenanceTasks = async () => {
    try {
      setMaintenanceLoading(true);
      const res = await axiosInstance.get("/tasks");
      setMaintenanceTasks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const fetchMaintenanceAutoTasks = async () => {
    try {
      setAutoTasksLoading(true);
      const res = await axiosInstance.get("/tasks/auto");
      setAutoTasks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch AI tasks");
    } finally {
      setAutoTasksLoading(false);
    }
  };

  const fetchMaintenanceUsers = async () => {
    try {
      const res = await axiosInstance.get("/user");
      const users = res.data.data || res.data;
      setMaintenanceUsers(users);
    } catch (err) {
      console.error("Failed to load users for assignment");
    }
  };

  const fetchMaintenanceWells = async () => {
    try {
      const res = await axiosInstance.get("/wells/admin/all?limit=100");
      const d = res.data.data;
      setMaintenanceWells(d.wells || []);
    } catch (err) {
      console.error("Failed to load wells for task assignment");
    }
  };

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await axiosInstance.put(`/tasks/${editingTask._id}`, taskForm);
        toast.success("Task updated successfully");
      } else {
        await axiosInstance.post("/tasks", { ...taskForm, status: "pending", autoGenerated: false });
        toast.success("Task created successfully");
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: "", description: "", priority: "medium", assignedTo: "", well: "" });
      fetchMaintenanceTasks();
    } catch (err) {
      toast.error(`Failed to ${editingTask ? "update" : "create"} task`);
    }
  };

  const handleDeleteMaintenanceTask = async (id) => {
    if (window.confirm("Delete this task?")) {
      try {
        await axiosInstance.delete(`/tasks/${id}`);
        toast.success("Task deleted successfully");
        fetchMaintenanceTasks();
      } catch (err) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleTaskStatusChange = async (id, status) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, { status });
      toast.success("Task status updated");
      fetchMaintenanceTasks();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleApproveAutoTask = async (id) => {
    try {
      await axiosInstance.post(`/tasks/auto/${id}/approve`);
      toast.success("Task approved and created");
      fetchMaintenanceAutoTasks();
    } catch (err) {
      toast.error("Failed to approve task");
    }
  };

  const handleRejectAutoTask = async (id) => {
    try {
      await axiosInstance.post(`/tasks/auto/${id}/reject`);
      toast.success("Task rejected");
      fetchMaintenanceAutoTasks();
    } catch (err) {
      toast.error("Failed to reject task");
    }
  };

  const handleDeleteAutoTask = async (id) => {
    if (window.confirm("Delete this auto task permanently?")) {
      try {
        await axiosInstance.delete(`/tasks/auto/${id}`);
        toast.success("Auto task deleted");
        fetchMaintenanceAutoTasks();
      } catch (err) {
        toast.error("Failed to delete auto task");
      }
    }
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", priority: "medium", assignedTo: "", well: "" });
    setShowTaskModal(true);
  };

  const handleRunAnalysis = async () => {
    try {
      setAnalysisRunning(true);
      setAnalysisResult(null);
      const res = await axiosInstance.post("/tasks/auto/run-analysis");
      setAnalysisResult(res.data);
      toast.success(res.data.message || "AI analysis completed!");
      // Refresh auto tasks and notifications to show newly created ones
      fetchMaintenanceAutoTasks();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to run AI analysis");
    } finally {
      setAnalysisRunning(false);
    }
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      well: task.well?._id || task.well || "",
    });
    setShowTaskModal(true);
  };

  // Fetch users when users nav is active
  useEffect(() => {
    if (activeNav === "users") {
      fetchUsers();
    }
    if (activeNav === "wells") {
      fetchAllWells(1, "", "");
      setWellSearch("");
      setWellStatus("");
    }
    if (activeNav === "maintenance") {
      fetchMaintenanceTasks();
      fetchMaintenanceAutoTasks();
      fetchMaintenanceUsers();
      fetchMaintenanceWells();
    }
    if (activeNav === "alerts") {
      fetchNotifications();
    }
  }, [activeNav]);

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

  // ✅ Update user details (same as UserDashboard)
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(
        `/user/${adminInfo?._id}`,
        updateForm
      );
      setAdminInfo(res.data.data);
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(res.data.data));
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // ✅ Change password (same as UserDashboard)
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      await axiosInstance.put("/user/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // 🔥 1. Kill session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // (optional) if you use axios default headers
      delete axiosInstance.defaults.headers.common["Authorization"];

      toast.success("Password changed successfully. Please login again.");

      // 🔥 2. Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("PASSWORD ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  // Handle input changes (same as UserDashboard)
  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
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
          className="p-3 rounded-lg"
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
        className={`fixed top-0 left-0 h-full bg-[#101624] border-r border-[#172431] transition-all duration-300 z-20 ${sidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[#172431]">
            <div className="flex items-center gap-3">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "dashboard"
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "users"
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "wells"
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "alerts"
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
              onClick={() => setActiveNav("reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "reports"
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
              {sidebarOpen && <span>Reports</span>}
            </button>
            <button
              onClick={() => setActiveNav("maintenance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "maintenance"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {sidebarOpen && <span>Maintenance</span>}
            </button>
            <button
              onClick={() => setActiveNav("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeNav === "settings"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {sidebarOpen && <span>Settings</span>}
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#172431]">
            <button
              onClick={() => setShowLogoutConfirm(true)}
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
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
          }`}
      >
        {/* Header */}
        <header className="bg-[#101624]/50 backdrop-blur-sm border-b border-[#172431] sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeNav === "dashboard" && "Dashboard"}
                  {activeNav === "users" && "Users Management"}
                  {activeNav === "wells" && "Wells Management"}
                  {activeNav === "alerts" && "Alerts Management"}
                  {activeNav === "reports" && "Reports"}
                  {activeNav === "maintenance" && "Maintenance"}
                  {activeNav === "settings" && "Settings"}
                </h1>
                <p className="text-[#9BA0A6] text-sm mt-1">
                  Welcome back,{" "}
                  {adminInfo?.firstName || adminInfo?.name || "Admin"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 rounded-lg hover:bg-[#172431] transition-colors"
                  >
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
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-[#CA6162] text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 top-12 w-96 bg-[#101624] rounded-xl border border-[#172431] shadow-2xl z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#172431]">
                        <h3 className="text-white font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-[#CA6162] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-8 text-center">
                            <svg className="w-10 h-10 mx-auto text-[#6B7280] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-[#6B7280] text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => {
                            const severityColors = {
                              critical: "border-l-red-500 bg-red-500/5",
                              high: "border-l-amber-500 bg-amber-500/5",
                              medium: "border-l-[#F5BD27] bg-[#F5BD27]/5",
                              low: "border-l-blue-400 bg-blue-400/5",
                            };
                            const colors = severityColors[notif.severity] || severityColors.medium;

                            return (
                              <button
                                key={notif._id}
                                onClick={() => handleNotifClick(notif)}
                                className={`w-full text-left px-5 py-3.5 border-l-[3px] hover:bg-[#172431]/50 transition-colors ${colors} ${!notif.read ? "" : "opacity-50"
                                  }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {notif.type === "AI Prediction" ? (
                                      <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-[#F5BD27] uppercase tracking-wider">{notif.type || "Alert"}</span>
                                      {!notif.read && <span className="w-1.5 h-1.5 bg-[#CA6162] rounded-full" />}
                                    </div>
                                    <p className="text-[#9BA0A6] text-sm leading-snug line-clamp-2">{notif.message}</p>
                                    <p className="text-[#6B7280] text-xs mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="border-t border-[#172431] px-5 py-3">
                          <button
                            onClick={() => { setShowNotifDropdown(false); setActiveNav("alerts"); }}
                            className="text-[#F5BD27] text-sm font-medium hover:underline w-full text-center"
                          >
                            View All Alerts →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
          {activeNav === "dashboard" && (
            <>
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
                      <h3 className="text-white font-semibold mb-4">
                        User Growth
                      </h3>
                      {userGrowth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={userGrowth}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#172431"
                            />
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
                        <h3 className="text-white font-semibold">
                          Recent Users
                        </h3>
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
            </>
          )}

          {/* USERS MANAGEMENT SECTION */}
          {activeNav === "users" && (
            <div className="bg-[#101624] rounded-xl border border-[#172431]">
              <div className="flex flex-wrap justify-between items-center gap-3 p-6 border-b border-[#172431]">
                <h2 className="text-2xl font-bold text-white">
                  Users Management
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors w-56"
                  />
                  <button
                    onClick={() => {
                      setAddUserError("");
                      setShowAddUserModal(true);
                    }}
                    className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-md whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add User
                  </button>
                </div>
              </div>

              <div className="p-6">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-[#9BA0A6]">Loading users...</p>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#9BA0A6]">
                      {search
                        ? "No users found matching your search"
                        : "No users found"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#172431] text-[#9BA0A6]">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Email</th>
                          <th className="p-3 text-center">Mobile</th>
                          <th className="p-3 text-center">Role</th>
                          <th className="p-3 text-center">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b border-[#172431] hover:bg-[#172431]/40 transition-colors"
                          >
                            <td className="p-3 text-white">
                              {user.firstName || user.name} {user.lastName}
                            </td>

                            <td className="p-3 text-[#9BA0A6]">{user.email}</td>

                            <td className="p-3 text-center text-[#9BA0A6]">
                              {user.mobile || "-"}
                            </td>

                            <td className="p-3 text-center">
                              <select
                                value={user.role || "User"}
                                onChange={(e) =>
                                  handleRoleChange(user._id, e.target.value)
                                }
                                className="bg-[#0A0E19] border border-[#172431] text-[#F5BD27] text-xs font-medium px-2 py-1 rounded-lg focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors cursor-pointer appearance-none"
                                style={{
                                  backgroundImage:
                                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23F5BD27'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
                                  backgroundRepeat: "no-repeat",
                                  backgroundPosition: "right 6px center",
                                  paddingRight: "22px",
                                }}
                              >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                                <option value="Villager">Villager</option>
                                <option value="Reporter">Reporter</option>
                              </select>
                            </td>

                            <td className="p-3 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => setViewUserPanel(user)}
                                  className="bg-[#178B96] hover:bg-[#178B96]/80 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() => handleDelete(user)}
                                  className="bg-[#CA6162] hover:bg-[#CA6162]/80 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Page - Updated with UserDashboard logic */}
          {activeNav === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                {/* Settings Header */}
                <div className="border-b border-[#172431] p-6">
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <p className="text-[#9BA0A6] mt-1">
                    Manage your account settings
                  </p>
                </div>

                {/* Settings Tabs */}
                <div className="flex border-b border-[#172431] bg-[#0A0E19]">
                  <button
                    onClick={() => setSettingsSubTab("details")}
                    className={`px-6 py-3 text-center transition-colors ${settingsSubTab === "details"
                        ? "border-b-2 border-[#F5BD27] text-[#F5BD27]"
                        : "text-[#9BA0A6] hover:text-gray-300"
                      }`}
                  >
                    Change User Details
                  </button>
                  <button
                    onClick={() => setSettingsSubTab("password")}
                    className={`px-6 py-3 text-center transition-colors ${settingsSubTab === "password"
                        ? "border-b-2 border-[#F5BD27] text-[#F5BD27]"
                        : "text-[#9BA0A6] hover:text-gray-300"
                      }`}
                  >
                    Change Password
                  </button>
                </div>

                {/* Settings Content */}
                <div className="p-6">
                  {settingsSubTab === "details" && (
                    <form onSubmit={handleUpdateDetails}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={updateForm.firstName}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={updateForm.lastName}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={updateForm.email}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Mobile
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={updateForm.mobile}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Address
                          </label>
                          <textarea
                            name="address"
                            value={updateForm.address}
                            onChange={handleUpdateChange}
                            rows="3"
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-6 py-2 rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (adminInfo) {
                              setUpdateForm({
                                firstName:
                                  adminInfo.firstName || adminInfo.name || "",
                                lastName: adminInfo.lastName || "",
                                email: adminInfo.email || "",
                                mobile: adminInfo.mobile || "",
                                address: adminInfo.address || "",
                              });
                            }
                          }}
                          className="bg-[#172431] hover:bg-[#1a2a3a] text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  )}

                  {settingsSubTab === "password" && (
                    <form onSubmit={handleChangePassword}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                          <p className="text-xs text-[#6B7280] mt-1">
                            Password must be at least 6 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#9BA0A6] mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-6 py-2 rounded-lg transition-colors"
                        >
                          Change Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordForm({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                          }}
                          className="bg-[#172431] hover:bg-[#1a2a3a] text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WELLS MANAGEMENT SECTION */}
          {activeNav === "wells" && (
            <div className="space-y-6">
              {/* Section header with Add Well button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">All Wells</h2>
                  <p className="text-sm text-[#9BA0A6] mt-0.5">
                    {wellTotal} wells across all users
                  </p>
                </div>
                <button
                  onClick={() => setShowAddWellModal(true)}
                  className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Well
                </button>
              </div>

              {/* Summary stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Wells", value: wellTotal, color: "#F5BD27" },
                  {
                    label: "Good",
                    value: allWells.filter((w) => w.status === "Good").length,
                    color: "#4BDA7F",
                  },
                  {
                    label: "Needs Repair",
                    value: allWells.filter((w) => w.status === "Needs Repair")
                      .length,
                    color: "#F5BD27",
                  },
                  {
                    label: "Contaminated / Dry",
                    value: allWells.filter(
                      (w) => w.status === "Contaminated" || w.status === "Dry"
                    ).length,
                    color: "#CA6162",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#101624] rounded-xl border border-[#172431] p-5"
                  >
                    <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-1">
                      {s.label}
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Search + filter bar */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] p-4">
                <div className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="🔍 Search by well name..."
                    value={wellSearch}
                    onChange={(e) => setWellSearch(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      fetchAllWells(1, wellSearch, wellStatus)
                    }
                    className="flex-1 min-w-[200px] px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  />
                  <select
                    value={wellStatus}
                    onChange={(e) => {
                      setWellStatus(e.target.value);
                      fetchAllWells(1, wellSearch, e.target.value);
                    }}
                    className="w-44 px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-all cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    {WELL_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => fetchAllWells(1, wellSearch, wellStatus)}
                    className="px-6 py-2.5 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold rounded-lg transition-all duration-300"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                {wellsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[#9BA0A6]">Loading wells...</p>
                    </div>
                  </div>
                ) : allWells.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      className="w-16 h-16 mx-auto text-[#6B7280] mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-[#9BA0A6]">No wells found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0A0E19] border-b border-[#172431]">
                        <tr>
                          {[
                            "Well Name",
                            "Owner",
                            "Location",
                            "Status",
                            "Photos",
                            "Last Inspected",
                            "Created",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172431]">
                        {allWells.map((w) => {
                          const style =
                            WELL_STATUS_STYLES[w.status] ||
                            WELL_STATUS_STYLES.Dry;
                          const owner = w.user;
                          return (
                            <tr
                              key={w._id}
                              onClick={() => setSelectedWell(w)}
                              className={`cursor-pointer transition-all duration-200 ${selectedWell?._id === w._id
                                  ? "bg-[#F5BD27]/5 border-l-4 border-l-[#F5BD27]"
                                  : "hover:bg-[#0A0E19]"
                                }`}
                            >
                              <td className="px-5 py-4">
                                <div className="font-semibold text-white">
                                  {w.name}
                                </div>
                                <div className="text-xs text-[#6B7280] mt-0.5 font-mono">
                                  {w._id.slice(-8)}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                {owner ? (
                                  <div>
                                    <div className="text-white text-sm">
                                      {owner.firstName} {owner.lastName}
                                    </div>
                                    <div className="text-xs text-[#6B7280]">
                                      {owner.email}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[#6B7280] text-xs">
                                    Unknown
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-[#9BA0A6] whitespace-nowrap">
                                {w.location?.lat?.toFixed(4)}°,{" "}
                                {w.location?.lng?.toFixed(4)}°
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                  style={{
                                    backgroundColor: `${style.bg}18`,
                                    color: style.bg,
                                    border: `1px solid ${style.bg}30`,
                                  }}
                                >
                                  {w.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center text-[#9BA0A6]">
                                {w.photos?.length || 0}
                              </td>
                              <td className="px-5 py-4 text-[#9BA0A6] whitespace-nowrap">
                                {w.lastInspected ? (
                                  new Date(w.lastInspected).toLocaleDateString()
                                ) : (
                                  <span className="text-[#6B7280] italic text-xs">
                                    Not inspected
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-[#9BA0A6] whitespace-nowrap">
                                {new Date(w.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {wellTotalPages > 1 && (
                <div className="flex items-center justify-between bg-[#0A0E19] rounded-xl border border-[#172431] px-5 py-3">
                  <span className="text-sm text-[#9BA0A6]">
                    Page {wellPage} of {wellTotalPages} &nbsp;·&nbsp;{" "}
                    {wellTotal} wells total
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={wellPage <= 1}
                      onClick={() => {
                        const p = wellPage - 1;
                        setWellPage(p);
                        fetchAllWells(p, wellSearch, wellStatus);
                      }}
                      className="px-4 py-2 bg-[#101624] text-[#9BA0A6] rounded-lg hover:bg-[#172431] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      disabled={wellPage >= wellTotalPages}
                      onClick={() => {
                        const p = wellPage + 1;
                        setWellPage(p);
                        fetchAllWells(p, wellSearch, wellStatus);
                      }}
                      className="px-4 py-2 bg-[#101624] text-[#9BA0A6] rounded-lg hover:bg-[#172431] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WELL DETAIL SLIDE-OVER MODAL */}
          {selectedWell &&
            (() => {
              const w = selectedWell;
              const style =
                WELL_STATUS_STYLES[w.status] || WELL_STATUS_STYLES.Dry;
              const owner = w.user;
              const API_URL =
                import.meta.env.VITE_API_URL || "http://localhost:5001";
              const photoUrl = (url) =>
                url?.startsWith("http") ? url : `${API_URL}${url}`;
              return (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setSelectedWell(null)}
                  />
                  {/* Panel */}
                  <div
                    className="fixed top-0 right-0 h-full w-full max-w-md bg-[#101624] border-l border-[#172431] z-50 flex flex-col shadow-2xl overflow-hidden animate-slide-in-right"
                    style={{ animation: "slideInRight 0.25s ease-out" }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-[#172431] bg-[#0A0E19]">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#9BA0A6] uppercase tracking-widest mb-1">
                          Well Details
                        </p>
                        <h2 className="text-xl font-bold text-white truncate">
                          {w.name}
                        </h2>
                        <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                          ID: {w._id}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedWell(null)}
                        className="ml-4 p-2 rounded-lg text-[#9BA0A6] hover:text-white hover:bg-[#172431] transition-colors flex-shrink-0"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {/* Status badge */}
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: `${style.bg}20`,
                            color: style.bg,
                            border: `1px solid ${style.bg}40`,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: style.bg }}
                          />
                          {w.status}
                        </span>
                      </div>

                      {/* Owner */}
                      <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                        <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                          Owner
                        </p>
                        {owner ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold text-sm">
                              {owner.firstName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {owner.firstName} {owner.lastName}
                              </p>
                              <p className="text-xs text-[#6B7280]">
                                {owner.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#6B7280] text-sm">
                            Unknown owner
                          </p>
                        )}
                      </div>

                      {/* Details grid */}
                      <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4 space-y-3">
                        <p className="text-xs text-[#9BA0A6] uppercase tracking-wider">
                          Well Information
                        </p>
                        {[
                          {
                            label: "Latitude",
                            value:
                              w.location?.lat != null
                                ? `${w.location.lat.toFixed(6)}°`
                                : "—",
                          },
                          {
                            label: "Longitude",
                            value:
                              w.location?.lng != null
                                ? `${w.location.lng.toFixed(6)}°`
                                : "—",
                          },
                          {
                            label: "Photos",
                            value: `${w.photos?.length || 0} photo${(w.photos?.length || 0) !== 1 ? "s" : ""
                              }`,
                          },
                          {
                            label: "Last Inspected",
                            value: w.lastInspected
                              ? new Date(w.lastInspected).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                              : "Never inspected",
                          },
                          {
                            label: "Created",
                            value: new Date(w.createdAt).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long", day: "numeric" }
                            ),
                          },
                          {
                            label: "Last Updated",
                            value: new Date(w.updatedAt).toLocaleDateString(
                              "en-US",
                              { year: "numeric", month: "long", day: "numeric" }
                            ),
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-start justify-between gap-4 py-2 border-b border-[#172431] last:border-0"
                          >
                            <span className="text-sm text-[#9BA0A6] flex-shrink-0">
                              {label}
                            </span>
                            <span className="text-sm text-white text-right font-mono">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Photos gallery */}
                      {w.photos?.length > 0 && (
                        <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                          <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                            Photos ({w.photos.length})
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {w.photos.map((photo, i) => (
                              <a
                                key={i}
                                href={photoUrl(photo)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden rounded-lg border border-[#172431] hover:border-[#F5BD27] transition-all duration-300"
                              >
                                <img
                                  src={photoUrl(photo)}
                                  alt={`Well ${i + 1}`}
                                  className="w-full h-20 object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                  </svg>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <style>{`
                  @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                  }
                `}</style>
                </>
              );
            })()}

          {/* REPORTS SECTION */}
          {activeNav === "reports" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Reports Management
                  </h2>
                  <p className="text-sm text-[#9BA0A6] mt-0.5">
                    Monitor and manage water well condition reports
                  </p>
                </div>
                <button
                  onClick={() => navigate("/create")}
                  className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Report
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#F5BD27]/10">
                      <svg
                        className="w-5 h-5 text-[#F5BD27]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Total Reports</p>
                  <p className="text-white text-2xl font-bold">
                    {reports.length}
                  </p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <svg
                        className="w-5 h-5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Pending</p>
                  <p className="text-white text-2xl font-bold">
                    {reports.filter((r) => r.status === "pending").length}
                  </p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Verified</p>
                  <p className="text-white text-2xl font-bold">
                    {reports.filter((r) => r.status === "verified").length}
                  </p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Rejected</p>
                  <p className="text-white text-2xl font-bold">
                    {reports.filter((r) => r.status === "rejected").length}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[#9BA0A6]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white text-sm focus:outline-none focus:border-[#F5BD27] transition-all cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="px-4 py-2 bg-[#0A0E19] border border-[#172431] rounded-lg text-white text-sm focus:outline-none focus:border-[#F5BD27] transition-all cursor-pointer"
                  >
                    <option value="">All Conditions</option>
                    <option value="DRY">Dry</option>
                    <option value="CONTAMINATED">Contaminated</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="LOW_WATER">Low Water</option>
                  </select>

                  {(filterStatus || filterCondition) && (
                    <button
                      onClick={() => {
                        setFilterStatus("");
                        setFilterCondition("");
                      }}
                      className="px-4 py-2 text-sm text-[#9BA0A6] hover:text-white border border-[#172431] hover:border-[#F5BD27]/50 rounded-lg transition-all"
                    >
                      Clear Filters
                    </button>
                  )}

                  <span className="ml-auto text-xs text-[#6B7280]">
                    {reportsLoading
                      ? "Loading..."
                      : `${reports.length} report${reports.length !== 1 ? "s" : ""
                      }`}
                  </span>
                </div>
              </div>

              {/* Reports Table */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                {reportsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[#9BA0A6]">Loading reports...</p>
                    </div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16">
                    <svg
                      className="w-16 h-16 mx-auto text-[#6B7280] mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-white font-semibold mb-1">
                      No reports found
                    </p>
                    <p className="text-[#9BA0A6] text-sm">
                      {filterStatus || filterCondition
                        ? "Try adjusting your filters"
                        : "Click 'Create Report' to get started"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0A0E19] border-b border-[#172431]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Well
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Condition
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Severity
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Reported By
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172431]">
                        {reports.map((report) => {
                          const getConditionStyles = () => {
                            switch (report.conditionType) {
                              case "DRY":
                                return {
                                  bg: "bg-amber-500/10",
                                  text: "text-amber-400",
                                  border: "border-amber-500/30",
                                  label: "Dry",
                                };
                              case "CONTAMINATED":
                                return {
                                  bg: "bg-red-500/10",
                                  text: "text-red-400",
                                  border: "border-red-500/30",
                                  label: "Contaminated",
                                };
                              case "DAMAGED":
                                return {
                                  bg: "bg-orange-500/10",
                                  text: "text-orange-400",
                                  border: "border-orange-500/30",
                                  label: "Damaged",
                                };
                              case "LOW_WATER":
                                return {
                                  bg: "bg-blue-500/10",
                                  text: "text-blue-400",
                                  border: "border-blue-500/30",
                                  label: "Low Water",
                                };
                              default:
                                return {
                                  bg: "bg-gray-500/10",
                                  text: "text-gray-400",
                                  border: "border-gray-500/30",
                                  label: report.conditionType,
                                };
                            }
                          };

                          const getStatusStyles = () => {
                            switch (report.status) {
                              case "pending":
                                return {
                                  bg: "bg-amber-500/10",
                                  text: "text-amber-400",
                                  dot: "bg-amber-400",
                                  label: "Pending",
                                };
                              case "verified":
                                return {
                                  bg: "bg-emerald-500/10",
                                  text: "text-emerald-400",
                                  dot: "bg-emerald-400",
                                  label: "Verified",
                                };
                              case "rejected":
                                return {
                                  bg: "bg-red-500/10",
                                  text: "text-red-400",
                                  dot: "bg-red-400",
                                  label: "Rejected",
                                };
                              default:
                                return {
                                  bg: "bg-gray-500/10",
                                  text: "text-gray-400",
                                  dot: "bg-gray-400",
                                  label: report.status,
                                };
                            }
                          };

                          const condStyle = getConditionStyles();
                          const statusStyle = getStatusStyles();
                          const severityScore =
                            report.severityScore ||
                            Math.floor(Math.random() * 10) + 1;
                          const severityPct = (severityScore / 10) * 100;
                          const severityColor =
                            severityScore >= 9
                              ? "bg-red-500"
                              : severityScore >= 7
                                ? "bg-orange-500"
                                : severityScore >= 4
                                  ? "bg-yellow-500"
                                  : "bg-emerald-500";

                          return (
                            <tr
                              key={report._id}
                              className="hover:bg-[#0A0E19] transition-colors cursor-pointer"
                              onClick={() => setSelectedReport(report)}
                            >
                              <td className="px-5 py-4">
                                <p className="font-medium text-white">
                                  {report.wellId?.name || "Unknown Well"}
                                </p>
                                {report.wellId?.location && (
                                  <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
                                    {report.wellId.location.lat?.toFixed(4)}°,{" "}
                                    {report.wellId.location.lng?.toFixed(4)}°
                                  </p>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${condStyle.bg} ${condStyle.text} ${condStyle.border}`}
                                >
                                  {condStyle.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 min-w-[80px]">
                                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${severityColor}`}
                                      style={{ width: `${severityPct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-300 tabular-nums">
                                    {severityScore}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-gray-300">
                                  {report.reportedBy?.firstName}{" "}
                                  {report.reportedBy?.lastName}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                  {report.reportedBy?.email}
                                </p>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                  />
                                  {statusStyle.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <p className="text-gray-400 whitespace-nowrap">
                                  {new Date(
                                    report.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/report/${report._id}`);
                                  }}
                                  className="text-[#F5BD27] hover:text-[#E6C27A] text-sm font-medium transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Report Detail Modal */}
              {selectedReport &&
                (() => {
                  const report = selectedReport;
                  const condStyle = (() => {
                    switch (report.conditionType) {
                      case "DRY":
                        return { bg: "#F5BD27", label: "Dry" };
                      case "CONTAMINATED":
                        return { bg: "#CA6162", label: "Contaminated" };
                      case "DAMAGED":
                        return { bg: "#F5BD27", label: "Damaged" };
                      case "LOW_WATER":
                        return { bg: "#4BDA7F", label: "Low Water" };
                      default:
                        return { bg: "#6B7280", label: report.conditionType };
                    }
                  })();
                  const statusStyle = (() => {
                    switch (report.status) {
                      case "pending":
                        return { bg: "#F5BD27", label: "Pending" };
                      case "verified":
                        return { bg: "#4BDA7F", label: "Verified" };
                      case "rejected":
                        return { bg: "#CA6162", label: "Rejected" };
                      default:
                        return { bg: "#6B7280", label: report.status };
                    }
                  })();

                  return (
                    <>
                      <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setSelectedReport(null)}
                      />
                      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#101624] border-l border-[#172431] z-50 flex flex-col shadow-2xl overflow-hidden">
                        <div className="flex items-start justify-between p-6 border-b border-[#172431] bg-[#0A0E19]">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#9BA0A6] uppercase tracking-widest mb-1">
                              Report Details
                            </p>
                            <h2 className="text-xl font-bold text-white truncate">
                              {report.wellId?.name || "Unknown Well"}
                            </h2>
                            <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                              ID: {report._id}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedReport(null)}
                            className="ml-4 p-2 rounded-lg text-[#9BA0A6] hover:text-white hover:bg-[#172431] transition-colors"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold`}
                              style={{
                                backgroundColor: `${condStyle.bg}20`,
                                color: condStyle.bg,
                                border: `1px solid ${condStyle.bg}40`,
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: condStyle.bg }}
                              />
                              {condStyle.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold`}
                              style={{
                                backgroundColor: `${statusStyle.bg}20`,
                                color: statusStyle.bg,
                                border: `1px solid ${statusStyle.bg}40`,
                              }}
                            >
                              {statusStyle.label}
                            </span>
                          </div>

                          <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                            <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                              Description
                            </p>
                            <p className="text-white text-sm leading-relaxed">
                              {report.description || "No description provided"}
                            </p>
                          </div>

                          <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                            <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                              Reported By
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold text-sm">
                                {report.reportedBy?.firstName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {report.reportedBy?.firstName}{" "}
                                  {report.reportedBy?.lastName}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                  {report.reportedBy?.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4 space-y-3">
                            <p className="text-xs text-[#9BA0A6] uppercase tracking-wider">
                              Well Information
                            </p>
                            {[
                              {
                                label: "Well Name",
                                value: report.wellId?.name || "—",
                              },
                              {
                                label: "Location",
                                value: report.wellId?.location
                                  ? `${report.wellId.location.lat?.toFixed(
                                    6
                                  )}°, ${report.wellId.location.lng?.toFixed(
                                    6
                                  )}°`
                                  : "—",
                              },
                              {
                                label: "Reported Date",
                                value: new Date(
                                  report.createdAt
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }),
                              },
                            ].map(({ label, value }) => (
                              <div
                                key={label}
                                className="flex items-start justify-between gap-4 py-2 border-b border-[#172431] last:border-0"
                              >
                                <span className="text-sm text-[#9BA0A6]">
                                  {label}
                                </span>
                                <span className="text-sm text-white text-right">
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {report.imageURL && (
                            <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                              <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                                Evidence Image
                              </p>
                              <img
                                src={report.imageURL}
                                alt="Evidence"
                                className="w-full rounded-lg border border-[#172431]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
            </div>
          )}

          {/* ALERTS SECTION */}
          {activeNav === "alerts" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Alerts & Notifications</h2>
                  <p className="text-sm text-[#9BA0A6] mt-0.5">View all system alerts and AI predictions</p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          for (const n of notifications.filter(x => !x.read)) {
                            await axiosInstance.put(`/alerts/${n._id}/read`);
                          }
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          toast.success("All notifications marked as read");
                        } catch (err) {
                          toast.error("Failed to mark all as read");
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-[#172431] hover:bg-[#1a2a3a] text-[#9BA0A6] hover:text-white font-medium px-4 py-2 rounded-lg transition-all text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark All Read
                    </button>
                  )}
                  <span className="bg-[#101624] border border-[#172431] text-[#9BA0A6] px-3 py-1.5 rounded-lg text-sm">
                    {notifications.length} total · {unreadCount} unread
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#F5BD27]/10">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Total Alerts</p>
                  <p className="text-white text-2xl font-bold">{notifications.length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Critical</p>
                  <p className="text-white text-2xl font-bold">{notifications.filter(n => n.severity === "critical").length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">High / Medium</p>
                  <p className="text-white text-2xl font-bold">{notifications.filter(n => n.severity === "high" || n.severity === "medium").length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Unread</p>
                  <p className="text-white text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>

              {/* Alerts List */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                {notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto text-[#6B7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-white font-semibold mb-1">No alerts yet</p>
                    <p className="text-[#9BA0A6] text-sm">Run AI Analysis from the Maintenance section to generate alerts.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#172431]">
                    {notifications.map((notif) => {
                      const severityConfig = {
                        critical: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30", label: "Critical" },
                        high: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", label: "High" },
                        medium: { bg: "bg-[#F5BD27]/10", text: "text-[#F5BD27]", border: "border-[#F5BD27]/30", label: "Medium" },
                        low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", label: "Low" },
                      };
                      const sc = severityConfig[notif.severity] || severityConfig.medium;

                      return (
                        <div
                          key={notif._id}
                          className={`px-6 py-5 flex items-start gap-4 transition-colors ${!notif.read ? "bg-[#172431]/20" : ""
                            } hover:bg-[#172431]/30`}
                        >
                          {/* Icon */}
                          <div className={`flex-shrink-0 p-2.5 rounded-xl ${sc.bg}`}>
                            {notif.type === "AI Prediction" ? (
                              <svg className={`w-5 h-5 ${sc.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            ) : (
                              <svg className={`w-5 h-5 ${sc.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`${sc.bg} ${sc.text} border ${sc.border} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
                                {sc.label}
                              </span>
                              <span className="text-xs font-semibold text-[#F5BD27] uppercase tracking-wider">
                                {notif.type || "Alert"}
                              </span>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-[#CA6162] rounded-full animate-pulse" />
                              )}
                            </div>
                            <p className="text-white text-sm font-medium leading-relaxed">{notif.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[#6B7280] text-xs">
                                {new Date(notif.createdAt).toLocaleString()}
                              </span>
                              <span className={`text-xs font-medium ${notif.status === "approved" ? "text-emerald-400" :
                                  notif.status === "rejected" ? "text-red-400" :
                                    "text-[#9BA0A6]"
                                }`}>
                                {notif.status === "approved" ? "✓ Approved" :
                                  notif.status === "rejected" ? "✕ Rejected" :
                                    "● Pending"}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkNotifRead(notif._id)}
                                className="p-2 rounded-lg text-[#9BA0A6] hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                title="Mark as read"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {notif.type === "AI Prediction" && (
                              <button
                                onClick={() => { setActiveNav("maintenance"); setMaintenanceSubTab("predictions"); }}
                                className="p-2 rounded-lg text-[#9BA0A6] hover:text-[#F5BD27] hover:bg-[#F5BD27]/10 transition-all"
                                title="View in Maintenance"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAINTENANCE SECTION */}
          {activeNav === "maintenance" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Maintenance Management</h2>
                  <p className="text-sm text-[#9BA0A6] mt-0.5">Manage maintenance tasks and AI-generated predictions</p>
                </div>
                <button
                  onClick={openCreateTaskModal}
                  className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 bg-[#0A0E19] p-1 rounded-xl border border-[#172431] w-fit">
                <button
                  onClick={() => setMaintenanceSubTab("tasks")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${maintenanceSubTab === "tasks"
                      ? "bg-[#F5BD27] text-[#0A0E19] shadow-lg"
                      : "text-[#9BA0A6] hover:text-white hover:bg-[#172431]"
                    }`}
                >
                  Tasks ({maintenanceTasks.length})
                </button>
                <button
                  onClick={() => setMaintenanceSubTab("predictions")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${maintenanceSubTab === "predictions"
                      ? "bg-[#F5BD27] text-[#0A0E19] shadow-lg"
                      : "text-[#9BA0A6] hover:text-white hover:bg-[#172431]"
                    }`}
                >
                  AI Predictions ({autoTasks.length})
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#F5BD27]/10">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Total Tasks</p>
                  <p className="text-white text-2xl font-bold">{maintenanceTasks.length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Pending</p>
                  <p className="text-white text-2xl font-bold">{maintenanceTasks.filter(t => t.status === "pending").length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">In Progress</p>
                  <p className="text-white text-2xl font-bold">{maintenanceTasks.filter(t => t.status === "in-progress").length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Completed</p>
                  <p className="text-white text-2xl font-bold">{maintenanceTasks.filter(t => t.status === "completed").length}</p>
                </div>
              </div>

              {/* TASKS SUB-TAB */}
              {maintenanceSubTab === "tasks" && (
                <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                  {maintenanceLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#9BA0A6]">Loading tasks...</p>
                      </div>
                    </div>
                  ) : maintenanceTasks.length === 0 ? (
                    <div className="text-center py-16">
                      <svg className="w-16 h-16 mx-auto text-[#6B7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-white font-semibold mb-1">No tasks yet</p>
                      <p className="text-[#9BA0A6] text-sm">Click "New Task" to create your first maintenance task.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#0A0E19] border-b border-[#172431]">
                          <tr>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Title</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Priority</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Assigned To</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Well</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Status</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Type</th>
                            <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#172431]">
                          {maintenanceTasks.map((task) => {
                            const priorityStyles = {
                              high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
                              medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
                              low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
                            };
                            const statusStyles = {
                              pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
                              "in-progress": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
                              completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
                            };
                            const ps = priorityStyles[task.priority] || priorityStyles.medium;
                            const ss = statusStyles[task.status] || statusStyles.pending;

                            return (
                              <tr key={task._id} className="hover:bg-[#172431]/50 transition-colors">
                                <td className="px-5 py-4">
                                  <p className="text-white font-medium">{task.title}</p>
                                  <p className="text-[#6B7280] text-xs mt-0.5 line-clamp-1 max-w-xs">{task.description}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`${ps.bg} ${ps.text} border ${ps.border} px-2.5 py-1 rounded-full text-xs font-semibold uppercase`}>
                                    {task.priority || "Medium"}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-[#9BA0A6] whitespace-nowrap">
                                  {task.assignedTo?.name || task.assignedTo?.firstName || <span className="text-[#6B7280] italic">Unassigned</span>}
                                </td>
                                <td className="px-5 py-4 text-[#9BA0A6] whitespace-nowrap">
                                  {task.well?.name || <span className="text-[#6B7280] italic">—</span>}
                                </td>
                                <td className="px-5 py-4">
                                  <select
                                    className="bg-[#0A0E19] border border-[#172431] text-xs rounded-lg px-2.5 py-1.5 text-[#9BA0A6] outline-none focus:border-[#F5BD27] cursor-pointer transition-colors"
                                    value={task.status}
                                    onChange={(e) => handleTaskStatusChange(task._id, e.target.value)}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </td>
                                <td className="px-5 py-4">
                                  {task.autoGenerated ? (
                                    <span className="bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/30 px-2.5 py-1 rounded-full text-xs font-semibold">AI Generated</span>
                                  ) : (
                                    <span className="text-[#6B7280] text-xs">Manual</span>
                                  )}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openEditTaskModal(task)}
                                      className="p-1.5 rounded-lg text-[#9BA0A6] hover:text-[#F5BD27] hover:bg-[#F5BD27]/10 transition-all"
                                      title="Edit Task"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMaintenanceTask(task._id)}
                                      className="p-1.5 rounded-lg text-[#9BA0A6] hover:text-[#CA6162] hover:bg-[#CA6162]/10 transition-all"
                                      title="Delete Task"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* AI PREDICTIONS SUB-TAB */}
              {maintenanceSubTab === "predictions" && (
                <div className="space-y-4">
                  {/* Run Analysis Button & Result */}
                  <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold text-lg">AI Predictive Analysis</h3>
                        <p className="text-[#9BA0A6] text-sm mt-1">Scan all wells and generate maintenance recommendations based on risk assessment</p>
                      </div>
                      <button
                        onClick={handleRunAnalysis}
                        disabled={analysisRunning}
                        className={`inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg ${analysisRunning
                            ? "bg-[#172431] text-[#9BA0A6] cursor-not-allowed"
                            : "bg-gradient-to-r from-[#F5BD27] to-[#E6C27A] hover:from-[#E6C27A] hover:to-[#F5BD27] text-[#0A0E19] transform hover:scale-105"
                          }`}
                      >
                        {analysisRunning ? (
                          <>
                            <div className="w-5 h-5 border-2 border-[#9BA0A6] border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Run AI Analysis
                          </>
                        )}
                      </button>
                    </div>

                    {/* Analysis Result Summary */}
                    {analysisResult && (
                      <div className="mt-4 p-4 bg-[#0A0E19] rounded-lg border border-[#172431]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-emerald-400 font-semibold text-sm">{analysisResult.message}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-white">{analysisResult.totalWells || 0}</p>
                            <p className="text-xs text-[#6B7280]">Wells Scanned</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-[#F5BD27]">{analysisResult.tasksTriggered || 0}</p>
                            <p className="text-xs text-[#6B7280]">Tasks Generated</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{(analysisResult.totalWells || 0) - (analysisResult.tasksTriggered || 0)}</p>
                            <p className="text-xs text-[#6B7280]">Wells OK</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {autoTasksLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[#9BA0A6]">Loading AI predictions...</p>
                      </div>
                    </div>
                  ) : autoTasks.length === 0 ? (
                    <div className="bg-[#101624] rounded-xl border border-[#172431] text-center py-16">
                      <svg className="w-16 h-16 mx-auto text-[#6B7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-white font-semibold mb-1">No AI Predictions</p>
                      <p className="text-[#9BA0A6] text-sm">The system will alert you when proactive maintenance is recommended.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {autoTasks.map((task) => (
                        <div key={task._id} className="bg-[#101624] rounded-xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                                RISK: {task.riskScore}/100
                              </span>
                              {task.status === "approved" && <span className="text-[10px] px-2 py-0.5 uppercase tracking-widest rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/50">Approved</span>}
                              {task.status === "rejected" && <span className="text-[10px] px-2 py-0.5 uppercase tracking-widest rounded bg-red-500/10 text-red-400 border border-red-500/50">Rejected</span>}
                              {task.status === "pending" && <span className="text-[10px] px-2 py-0.5 uppercase tracking-widest rounded bg-amber-500/10 text-amber-400 border border-amber-500/50">Pending</span>}
                            </div>
                            <span className="text-xs text-[#6B7280]">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white mb-2">Predicted Maintenance Required</h3>
                          <p className="text-[#9BA0A6] text-sm leading-relaxed mb-4">{task.reason}</p>

                          <div className="bg-[#0A0E19] rounded-lg p-3 border border-[#172431] mb-4">
                            <p className="text-xs text-[#6B7280] mb-1 font-medium uppercase tracking-wider">Suggested Action Date</p>
                            <p className="text-sm font-semibold text-amber-400">{new Date(task.predictedDate).toDateString()}</p>
                          </div>

                          {task.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveAutoTask(task._id)}
                                className="flex-1 bg-[#F5BD27]/20 text-[#F5BD27] border border-[#F5BD27]/50 hover:bg-[#F5BD27] hover:text-[#0A0E19] transition-all py-2.5 rounded-lg flex justify-center items-center font-bold text-sm"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept & Create Task
                              </button>
                              <button
                                onClick={() => handleRejectAutoTask(task._id)}
                                className="bg-[#172431] text-[#9BA0A6] border border-[#172431] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all px-4 py-2.5 rounded-lg"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAutoTask(task._id)}
                                className="bg-[#172431] text-[#9BA0A6] border border-[#172431] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all px-3 py-2.5 rounded-lg"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-sm text-[#6B7280] font-medium">
                                Reviewed & {task.status === "approved" ? "Converted to Task" : "Dismissed"}
                              </span>
                              <button
                                onClick={() => handleDeleteAutoTask(task._id)}
                                className="text-[#6B7280] hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Delete User Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div
            className="bg-[#101624] rounded-2xl border border-[#172431] shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: "fadeScaleIn 0.2s ease-out" }}
          >
            {/* Red accent top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#CA6162] to-[#e07c7c]" />

            <div className="p-6">
              {/* Warning icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#CA6162]/10 border border-[#CA6162]/20 flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[#CA6162]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-white text-center mb-1">
                Delete User
              </h3>
              <p className="text-[#9BA0A6] text-sm text-center mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-white font-semibold text-center mb-4">
                {deleteConfirm.firstName} {deleteConfirm.lastName}
              </p>
              <p className="text-xs text-[#6B7280] text-center mb-6">
                This action cannot be undone. All data associated with this
                account will be permanently removed.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 bg-[#172431] hover:bg-[#1a2a3a] text-white font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-[#CA6162] hover:bg-[#b85555] text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeScaleIn {
              from { opacity: 0; transform: scale(0.93); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* User Detail Slide-Over Panel */}
      {viewUserPanel &&
        (() => {
          const u = viewUserPanel;
          const ROLE_COLORS = {
            Admin: { bg: "#F5BD27", label: "Admin" },
            User: { bg: "#178B96", label: "User" },
            Villager: { bg: "#4BDA7F", label: "Villager" },
            Reporter: { bg: "#A38F7A", label: "Reporter" },
          };
          const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.User;
          return (
            <>
              {/* Backdrop */}
              {/* Panel */}
              <div
                className="fixed top-0 right-0 h-full w-full max-w-md bg-[#101624] border-l border-[#172431] z-50 flex flex-col shadow-2xl overflow-hidden"
                style={{ animation: "slideInRight 0.25s ease-out" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[#172431] bg-[#0A0E19]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#9BA0A6] uppercase tracking-widest mb-1">
                      User Details
                    </p>
                    <h2 className="text-xl font-bold text-white truncate">
                      {u.firstName} {u.lastName}
                    </h2>
                    <p className="text-xs text-[#6B7280] font-mono mt-0.5">
                      ID: {u._id}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewUserPanel(null)}
                    className="ml-4 p-2 rounded-lg text-[#9BA0A6] hover:text-white hover:bg-[#172431] transition-colors flex-shrink-0"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Avatar + role */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold text-2xl flex-shrink-0">
                      {u.firstName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        {u.firstName} {u.lastName}
                      </p>
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1"
                        style={{
                          backgroundColor: `${roleStyle.bg}20`,
                          color: roleStyle.bg,
                          border: `1px solid ${roleStyle.bg}40`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: roleStyle.bg }}
                        />
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4 space-y-0">
                    <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                      Contact Information
                    </p>
                    {[
                      { label: "Email", value: u.email || "—" },
                      { label: "Mobile", value: u.mobile || "—" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 py-2.5 border-b border-[#172431] last:border-0"
                      >
                        <span className="text-sm text-[#9BA0A6]">{label}</span>
                        <span className="text-sm text-white font-mono break-all text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Personal details */}
                  <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                    <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                      Personal Details
                    </p>
                    {[
                      { label: "NIC", value: u.nic || "—" },
                      { label: "Gender", value: u.gender || "—" },
                      {
                        label: "Date of Birth",
                        value: u.dob
                          ? new Date(u.dob).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "—",
                      },
                      { label: "Address", value: u.address || "—" },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-4 py-2.5 border-b border-[#172431] last:border-0"
                      >
                        <span className="text-sm text-[#9BA0A6] flex-shrink-0">
                          {label}
                        </span>
                        <span className="text-sm text-white text-right">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Account info */}
                  <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
                    <p className="text-xs text-[#9BA0A6] uppercase tracking-wider mb-3">
                      Account
                    </p>
                    {[
                      { label: "User ID", value: u.userId || u._id?.slice(-8) },
                      {
                        label: "Verified",
                        value: u.isVerified ? "✓ Verified" : "✗ Not verified",
                      },
                      {
                        label: "Joined",
                        value: u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "—",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 py-2.5 border-b border-[#172431] last:border-0"
                      >
                        <span className="text-sm text-[#9BA0A6]">{label}</span>
                        <span
                          className={`text-sm font-mono ${label === "Verified"
                              ? u.isVerified
                                ? "text-[#4BDA7F]"
                                : "text-[#CA6162]"
                              : "text-white"
                            }`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to   { transform: translateX(0);    opacity: 1; }
              }
            `}</style>
            </>
          );
        })()}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#101624] rounded-2xl border border-[#172431] shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#172431] bg-[#0A0E19]">
                <div>
                  <p className="text-xs text-[#9BA0A6] uppercase tracking-widest mb-0.5">
                    Admin
                  </p>
                  <h2 className="text-xl font-bold text-white">Add New User</h2>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 rounded-lg text-[#9BA0A6] hover:text-white hover:bg-[#172431] transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleAddUser} className="p-6 space-y-5">
                {addUserError && (
                  <div className="bg-[#CA6162]/10 border-l-4 border-[#CA6162] px-4 py-3 rounded-lg">
                    <p className="text-[#CA6162] text-sm">{addUserError}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "First Name",
                      name: "firstName",
                      type: "text",
                      placeholder: "John",
                    },
                    {
                      label: "Last Name",
                      name: "lastName",
                      type: "text",
                      placeholder: "Doe",
                    },
                    {
                      label: "Email",
                      name: "email",
                      type: "email",
                      placeholder: "user@example.com",
                    },
                    {
                      label: "Password",
                      name: "password",
                      type: "password",
                      placeholder: "Min. 6 characters",
                    },
                    {
                      label: "NIC",
                      name: "nic",
                      type: "text",
                      placeholder: "e.g. 990001234V",
                    },
                    {
                      label: "Mobile",
                      name: "mobile",
                      type: "text",
                      placeholder: "e.g. +94771234567",
                    },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                        {label} *
                      </label>
                      <input
                        type={type}
                        required
                        minLength={name === "password" ? 6 : undefined}
                        value={addUserForm[name]}
                        onChange={(e) =>
                          setAddUserForm((f) => ({
                            ...f,
                            [name]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                      Gender *
                    </label>
                    <select
                      required
                      value={addUserForm.gender}
                      onChange={(e) =>
                        setAddUserForm((f) => ({
                          ...f,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={addUserForm.dob}
                      onChange={(e) =>
                        setAddUserForm((f) => ({ ...f, dob: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                    Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={addUserForm.address}
                    onChange={(e) =>
                      setAddUserForm((f) => ({ ...f, address: e.target.value }))
                    }
                    placeholder="Full address..."
                    className="w-full px-3 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9BA0A6] mb-2">
                    Role
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["User", "Admin", "Villager", "Reporter"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setAddUserForm((f) => ({ ...f, role: r }))
                        }
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${addUserForm.role === r
                            ? "bg-[#F5BD27] border-[#F5BD27] text-[#0A0E19]"
                            : "bg-[#0A0E19] border-[#172431] text-[#9BA0A6] hover:border-[#F5BD27]"
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addUserLoading}
                    className="flex-1 bg-gradient-to-r from-[#F5BD27] to-[#E6C27A] hover:from-[#E6C27A] hover:to-[#F5BD27] text-[#0A0E19] font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {addUserLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#0A0E19] border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create User"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-6 py-2.5 bg-[#172431] hover:bg-[#1a2a3a] text-white font-medium rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Well Modal */}
      {showAddWellModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AddWell
              onSuccess={() => {
                setShowAddWellModal(false);
                fetchAllWells(wellPage, wellSearch, wellStatus);
              }}
              onCancel={() => setShowAddWellModal(false)}
            />
          </div>
        </div>
      )}

      {/* Task Create/Edit Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#101624] rounded-2xl border border-[#172431] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#172431]">
              <h2 className="text-xl font-bold text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                className="text-[#9BA0A6] hover:text-white transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9BA0A6] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-colors"
                  placeholder="e.g. Inspect Well Pump"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9BA0A6] mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-colors"
                  placeholder="Detailed task description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9BA0A6] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9BA0A6] mb-1">Assign To</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-colors"
                  >
                    <option value="">-- Unassigned --</option>
                    {maintenanceUsers.filter(u => u.role !== "Admin").map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9BA0A6] mb-1">Well</label>
                <select
                  value={taskForm.well}
                  onChange={(e) => setTaskForm({ ...taskForm, well: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] transition-colors"
                >
                  <option value="">-- No Well --</option>
                  {maintenanceWells.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowTaskModal(false); setEditingTask(null); }}
                  className="px-6 py-2.5 bg-[#172431] hover:bg-[#1a2a3a] text-white font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-bold rounded-xl transition-all shadow-lg"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#101624] rounded-lg w-full max-w-md mx-4 border border-[#172431] p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-[#9BA0A6] mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-[#CA6162] hover:bg-[#CA6162]/80 text-white py-2 rounded-lg transition-colors"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-[#172431] hover:bg-[#1a2a3a] text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
