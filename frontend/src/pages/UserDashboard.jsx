// frontend/src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import WellList from "./WellList";
import { fetchReports } from "../api/reportApi";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [settingsSubTab, setSettingsSubTab] = useState("details");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // REPORTS STATE
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // MAINTENANCE STATE
  const [myTasks, setMyTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // FETCH USER'S REPORTS
  const fetchUserReports = async () => {
    try {
      setReportsLoading(true);
      const query = {};
      if (filterStatus) query.status = filterStatus;
      if (filterCondition) query.conditionType = filterCondition;
      const res = await fetchReports(query);
      // Filter reports to only show the current user's reports
      const userReports = (res.data || []).filter(
        (report) => report.reportedBy?._id === user?._id
      );
      setReports(userReports);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch reports when reports tab is active or filters change
  useEffect(() => {
    if (activeTab === "reports" && user) {
      fetchUserReports();
    }
  }, [activeTab, filterStatus, filterCondition, user]);

  // MAINTENANCE FETCH FUNCTION
  const fetchMyTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await axiosInstance.get("/tasks");
      // Filter to only show tasks assigned to this user
      const userTasks = (res.data || []).filter(
        (task) => task.assignedTo?._id === user?._id || task.assignedTo === user?._id
      );
      setMyTasks(userTasks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tasks");
    } finally {
      setTasksLoading(false);
    }
  };

  const handleMyTaskStatusChange = async (id, status) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, { status });
      toast.success("Task status updated");
      fetchMyTasks();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Fetch tasks when maintenance tab is active
  useEffect(() => {
    if (activeTab === "maintenance" && user) {
      fetchMyTasks();
    }
  }, [activeTab, user]);

  // Form states for updating details
  const [updateForm, setUpdateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
  });

  // Form states for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        console.log(res.data);
        setUser(res.data.data);

        // Populate update form with user data
        if (res.data.data) {
          setUpdateForm({
            firstName: res.data.data.firstName || "",
            lastName: res.data.data.lastName || "",
            email: res.data.data.email || "",
            mobile: res.data.data.mobile || "",
            address: res.data.data.address || "",
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Logout with confirmation
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Update user details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/user/${user._id}`, updateForm);
      setUser(res.data.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

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

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axiosInstance.defaults.headers.common["Authorization"];

      toast.success("Password changed successfully. Please login again.");
      navigate("/login");
    } catch (err) {
      console.error("PASSWORD ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  // Handle input changes
  const handleUpdateChange = (e) => {
    setUpdateForm({ ...updateForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9BA0A6]">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "profile"
                ? "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20"
                : "text-[#9BA0A6] hover:bg-[#172431]"
                }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              {sidebarOpen && <span>Profile</span>}
            </button>

            <button
              onClick={() => setActiveTab("well")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "well"
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
              {sidebarOpen && <span>Well</span>}
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "reports"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {sidebarOpen && <span>Reports</span>}
            </button>

            <button
              onClick={() => setActiveTab("maintenance")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "maintenance"
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
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${activeTab === "settings"
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
                  {activeTab === "profile" && "Profile"}
                  {activeTab === "well" && "Well Management"}
                  {activeTab === "reports" && "Reports"}
                  {activeTab === "maintenance" && "My Tasks"}
                  {activeTab === "settings" && "Settings"}
                </h1>
                <p className="text-[#9BA0A6] text-sm mt-1">
                  Welcome back, {user?.firstName || "User"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold">
                    {user?.firstName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-white text-sm font-medium">
                      {fullName || "User"}
                    </p>
                    <p className="text-[#6B7280] text-xs">
                      {user?.role || "User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Profile Page */}
          {activeTab === "profile" && (
            <div className="max-w-5xl mx-auto px-4">
              {/* Welcome Header with Gradient */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-[#101624] to-[#0A0E19] rounded-2xl border border-[#172431] p-8">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#F5BD27] to-[#F5BD27]/60 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#101624]">
                          {fullName?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#101624]"></div>
                    </div>

                    {/* Welcome Text */}
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        Welcome back, {fullName?.split(" ")[0] || "User"}! 👋
                      </h2>
                      <p className="text-[#9BA0A6] mt-1">
                        Here's your profile overview and account details
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-xl border border-[#172431] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#9BA0A6] text-sm">Member Since</p>
                      <p className="text-white text-lg font-semibold mt-1">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-[#F5BD27]/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-xl border border-[#172431] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#9BA0A6] text-sm">Account Status</p>
                      <p className="text-white text-lg font-semibold mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-xl border border-[#172431] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#9BA0A6] text-sm">Verification</p>
                      <p className={`text-white text-lg font-semibold mt-1 ${user?.isVerified ? 'text-green-500' : 'text-red-500'}`}>
                        {user?.isVerified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${user?.isVerified ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <svg className={`w-5 h-5 ${user?.isVerified ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {user?.isVerified ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Profile Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Information Card */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden hover:border-[#F5BD27]/30 transition-all duration-300">
                  <div className="bg-gradient-to-r from-[#F5BD27]/10 to-transparent px-6 py-4 border-b border-[#172431]">
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Information
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Full Name</p>
                          <p className="text-white font-medium">{fullName || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Email Address</p>
                          <p className="text-white font-medium">{user?.email || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">NIC Number</p>
                          <p className="text-white font-medium">{user?.nic || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Mobile Number</p>
                          <p className="text-white font-medium">{user?.mobile || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Address</p>
                          <p className="text-white font-medium">{user?.address || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Gender</p>
                          <p className="text-white font-medium">{user?.gender || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Date of Birth</p>
                          <p className="text-white font-medium">
                            {user?.dob ? new Date(user.dob).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-2">
                        <div className="w-8 h-8 bg-[#0A0E19] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#9BA0A6] text-sm">Role</p>
                          <div>
                            <span className="inline-block bg-[#F5BD27]/10 text-[#F5BD27] px-3 py-1 rounded-lg text-sm font-medium">
                              {user?.role || "User"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Status & Activity Card */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden hover:border-[#F5BD27]/30 transition-all duration-300">
                  <div className="bg-gradient-to-r from-[#F5BD27]/10 to-transparent px-6 py-4 border-b border-[#172431]">
                    <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Account & Security
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="bg-[#0A0E19] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#9BA0A6]">Account Status</span>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-500 font-medium">Active</span>
                          </div>
                        </div>
                        <div className="w-full bg-[#172431] rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div className="bg-[#0A0E19] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#9BA0A6]">Email Verification</span>
                          <span className={`font-medium ${user?.isVerified ? 'text-green-500' : 'text-red-500'}`}>
                            {user?.isVerified ? "✓ Verified" : "✗ Unverified"}
                          </span>
                        </div>
                        <div className="w-full bg-[#172431] rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-500 ${user?.isVerified ? 'bg-green-500 w-full' : 'bg-red-500 w-0'}`}></div>
                        </div>
                        {!user?.isVerified && (
                          <button className="mt-3 text-sm text-[#F5BD27] hover:text-[#F5BD27]/80 transition-colors">
                            Verify Email →
                          </button>
                        )}
                      </div>

                      <div className="bg-[#0A0E19] rounded-lg p-4">
                        <p className="text-[#9BA0A6] mb-2">Member Since</p>
                        <p className="text-white text-lg font-semibold">
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                            : "N/A"}
                        </p>
                      </div>

                      {/* Quick Actions */}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Well Management Page - Using WellList Component */}
          {activeTab === "well" && (
            <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
              <WellList />
            </div>
          )}

          {/* Reports Page */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">My Reports</h2>
                  <p className="text-sm text-[#9BA0A6] mt-0.5">
                    View and manage your submitted water well condition reports
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
                      <p className="text-[#9BA0A6]">Loading your reports...</p>
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
                      No reports yet
                    </p>
                    <p className="text-[#9BA0A6] text-sm">
                      Click "Create Report" to submit your first water well
                      condition report.
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

                          const handleDelete = async (e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this report? This action cannot be undone."
                              )
                            ) {
                              try {
                                await axiosInstance.delete(
                                  `/report/${report._id}`
                                );
                                toast.success("Report deleted successfully");
                                fetchUserReports(); // Refresh the reports list
                              } catch (err) {
                                console.error(err);
                                toast.error(
                                  err.response?.data?.message ||
                                  "Failed to delete report"
                                );
                              }
                            }
                          };

                          return (
                            <tr
                              key={report._id}
                              className="hover:bg-[#0A0E19] transition-colors"
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
                                  onClick={handleDelete}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#CA6162]/10 hover:bg-[#CA6162]/20 text-[#CA6162] rounded-lg text-sm font-medium transition-all duration-200"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete
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
            </div>
          )}

          {/* Maintenance (My Tasks) Page */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold text-white">My Assigned Tasks</h2>
                <p className="text-sm text-[#9BA0A6] mt-0.5">View and update the status of tasks assigned to you</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-[#F5BD27]/10">
                      <svg className="w-5 h-5 text-[#F5BD27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Total Tasks</p>
                  <p className="text-white text-2xl font-bold">{myTasks.length}</p>
                </div>
                <div className="bg-[#101624] rounded-xl border border-[#172431] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#9BA0A6] text-sm">Pending / In Progress</p>
                  <p className="text-white text-2xl font-bold">{myTasks.filter(t => t.status !== "completed").length}</p>
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
                  <p className="text-white text-2xl font-bold">{myTasks.filter(t => t.status === "completed").length}</p>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[#9BA0A6]">Loading your tasks...</p>
                    </div>
                  </div>
                ) : myTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto text-[#6B7280] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-white font-semibold mb-1">No tasks assigned to you</p>
                    <p className="text-[#9BA0A6] text-sm">You'll see tasks here when an admin assigns them to you.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0A0E19] border-b border-[#172431]">
                        <tr>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Title</th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Priority</th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Well</th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Status</th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Type</th>
                          <th className="px-5 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#172431]">
                        {myTasks.map((task) => {
                          const priorityStyles = {
                            high: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
                            medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
                            low: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
                          };
                          const ps = priorityStyles[task.priority] || priorityStyles.medium;

                          const getAvailableStatuses = (currentStatus) => {
                            if (currentStatus === "completed") return [{ value: "completed", label: "Completed" }];
                            if (currentStatus === "in-progress") return [
                              { value: "in-progress", label: "In Progress" },
                              { value: "completed", label: "Completed" }
                            ];
                            return [
                              { value: "pending", label: "Pending" },
                              { value: "in-progress", label: "In Progress" },
                              { value: "completed", label: "Completed" }
                            ];
                          };
                          const availableStatuses = getAvailableStatuses(task.status);

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
                                {task.well?.name || <span className="text-[#6B7280] italic">—</span>}
                              </td>
                              <td className="px-5 py-4">
                                <select
                                  className={`bg-[#0A0E19] border border-[#172431] text-xs rounded-lg px-2.5 py-1.5 text-[#9BA0A6] outline-none focus:border-[#F5BD27] transition-colors ${task.status === "completed" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                  value={task.status}
                                  disabled={task.status === "completed"}
                                  onChange={(e) => handleMyTaskStatusChange(task._id, e.target.value)}
                                >
                                  {availableStatuses.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-5 py-4">
                                {task.autoGenerated ? (
                                  <span className="bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/30 px-2.5 py-1 rounded-full text-xs font-semibold">AI Generated</span>
                                ) : (
                                  <span className="text-[#6B7280] text-xs">Manual</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-[#6B7280] text-xs whitespace-nowrap">
                                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Page */}
          {activeTab === "settings" && (
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
                            if (user) {
                              setUpdateForm({
                                firstName: user.firstName || "",
                                lastName: user.lastName || "",
                                email: user.email || "",
                                mobile: user.mobile || "",
                                address: user.address || "",
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
        </div>
      </main>

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
    </div>
  );
};

export default UserDashboard;
