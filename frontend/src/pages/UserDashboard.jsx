import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [settingsSubTab, setSettingsSubTab] = useState("details");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // ✅ Fetch user profile from backend
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

  // ✅ Logout with confirmation
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // ✅ Update user details
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
        className={`fixed top-0 left-0 h-full bg-[#101624] border-r border-[#172431] transition-all duration-300 z-20 ${
          sidebarOpen ? "w-64" : "w-20"
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "profile"
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
              onClick={() => setActiveTab("btn1")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "btn1"
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
              {sidebarOpen && <span>Button 1</span>}
            </button>

            <button
              onClick={() => setActiveTab("btn2")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "btn2"
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
              {sidebarOpen && <span>Button 2</span>}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                activeTab === "settings"
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
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-[#101624]/50 backdrop-blur-sm border-b border-[#172431] sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === "profile" && "Profile"}
                  {activeTab === "btn1" && "Button 1"}
                  {activeTab === "btn2" && "Button 2"}
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
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-white">
                    Welcome, {fullName || "User"} 👋
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Profile Card */}
                    <div className="bg-[#0A0E19] p-6 rounded-lg border border-[#172431]">
                      <h3 className="font-semibold mb-4 text-lg text-white">
                        Profile Information
                      </h3>

                      <div className="space-y-2 text-[#9BA0A6]">
                        <p>
                          <b className="text-gray-400">Name:</b> {fullName}
                        </p>
                        <p>
                          <b className="text-gray-400">Email:</b> {user?.email}
                        </p>
                        <p>
                          <b className="text-gray-400">NIC:</b> {user?.nic}
                        </p>
                        <p>
                          <b className="text-gray-400">Mobile:</b>{" "}
                          {user?.mobile}
                        </p>
                        <p>
                          <b className="text-gray-400">Address:</b>{" "}
                          {user?.address}
                        </p>
                        <p>
                          <b className="text-gray-400">Gender:</b>{" "}
                          {user?.gender}
                        </p>
                        <p>
                          <b className="text-gray-400">Date of Birth:</b>{" "}
                          {user?.dob
                            ? new Date(user.dob).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p>
                          <b className="text-gray-400">Role:</b>{" "}
                          <span className="bg-[#F5BD27]/10 text-[#F5BD27] px-2 py-1 rounded text-sm">
                            {user?.role}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-[#0A0E19] p-6 rounded-lg border border-[#172431]">
                      <h3 className="font-semibold mb-4 text-lg text-white">
                        Account Status
                      </h3>

                      <div className="space-y-3 text-[#9BA0A6]">
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span className="bg-[#4BDA7F]/10 text-[#4BDA7F] px-2 py-1 rounded text-sm">
                            Active
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Email Verified</span>
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              user?.isVerified
                                ? "bg-[#4BDA7F]/10 text-[#4BDA7F]"
                                : "bg-[#CA6162]/10 text-[#CA6162]"
                            }`}
                          >
                            {user?.isVerified ? "Yes" : "No"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Joined</span>
                          <span className="text-[#6B7280]">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Button 1 Page */}
          {activeTab === "btn1" && (
            <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Button 1 Page
              </h2>
              <p className="text-[#9BA0A6]">Content for Button 1 goes here.</p>
            </div>
          )}

          {/* Button 2 Page */}
          {activeTab === "btn2" && (
            <div className="bg-[#101624] rounded-xl border border-[#172431] p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Button 2 Page
              </h2>
              <p className="text-[#9BA0A6]">Content for Button 2 goes here.</p>
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
                    className={`px-6 py-3 text-center transition-colors ${
                      settingsSubTab === "details"
                        ? "border-b-2 border-[#F5BD27] text-[#F5BD27]"
                        : "text-[#9BA0A6] hover:text-gray-300"
                    }`}
                  >
                    Change User Details
                  </button>
                  <button
                    onClick={() => setSettingsSubTab("password")}
                    className={`px-6 py-3 text-center transition-colors ${
                      settingsSubTab === "password"
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
                            // Reset form to current user data
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
