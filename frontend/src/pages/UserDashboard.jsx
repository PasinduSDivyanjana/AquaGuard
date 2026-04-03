import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [settingsSubTab, setSettingsSubTab] = useState("details");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    navigate("/login");
  };

  // ✅ Update user details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put(`/user/${user._id}`, updateForm);
      setUser(res.data.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
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

      alert("Password changed successfully. Please login again.");

      // 🔥 2. Redirect to login
      navigate("/login");
    } catch (err) {
      console.error("PASSWORD ERROR:", err.response?.data || err.message);

      alert(err.response?.data?.message || "Failed to change password");
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-lg font-medium text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-purple-400">Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Welcome back!</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
              activeTab === "profile"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>👤</span> Profile
          </button>

          <button
            onClick={() => setActiveTab("btn1")}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
              activeTab === "btn1"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>🔘</span> Button 1
          </button>

          <button
            onClick={() => setActiveTab("btn2")}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
              activeTab === "btn2"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>🔘</span> Button 2
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${
              activeTab === "settings"
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>⚙️</span> Settings
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-left px-6 py-3 flex items-center gap-3 text-red-400 hover:bg-gray-700 transition-colors mt-4"
          >
            <span>🚪</span> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Profile Page */}
          {activeTab === "profile" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-white">
                  Welcome, {fullName || "User"} 👋
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Profile Card */}
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-4 text-lg text-white">
                      Profile Information
                    </h3>

                    <div className="space-y-2 text-gray-300">
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
                        <b className="text-gray-400">Mobile:</b> {user?.mobile}
                      </p>
                      <p>
                        <b className="text-gray-400">Address:</b>{" "}
                        {user?.address}
                      </p>
                      <p>
                        <b className="text-gray-400">Gender:</b> {user?.gender}
                      </p>
                      <p>
                        <b className="text-gray-400">Date of Birth:</b>{" "}
                        {user?.dob
                          ? new Date(user.dob).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <b className="text-gray-400">Role:</b>{" "}
                        <span className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-sm">
                          {user?.role}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <h3 className="font-semibold mb-4 text-lg text-white">
                      Account Status
                    </h3>

                    <div className="space-y-3 text-gray-300">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-sm">
                          Active
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Email Verified</span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            user?.isVerified
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {user?.isVerified ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>Joined</span>
                        <span className="text-gray-400">
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
          )}

          {/* Button 1 Page */}
          {activeTab === "btn1" && (
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Button 1 Page
              </h2>
              <p className="text-gray-400">Content for Button 1 goes here.</p>
            </div>
          )}

          {/* Button 2 Page */}
          {activeTab === "btn2" && (
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Button 2 Page
              </h2>
              <p className="text-gray-400">Content for Button 2 goes here.</p>
            </div>
          )}

          {/* Settings Page */}
          {activeTab === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                {/* Settings Header */}
                <div className="border-b border-gray-700 p-6">
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <p className="text-gray-400 mt-1">
                    Manage your account settings
                  </p>
                </div>

                {/* Settings Tabs */}
                <div className="flex border-b border-gray-700 bg-gray-900">
                  <button
                    onClick={() => setSettingsSubTab("details")}
                    className={`px-6 py-3 text-center transition-colors ${
                      settingsSubTab === "details"
                        ? "border-b-2 border-purple-500 text-purple-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Change User Details
                  </button>
                  <button
                    onClick={() => setSettingsSubTab("password")}
                    className={`px-6 py-3 text-center transition-colors ${
                      settingsSubTab === "password"
                        ? "border-b-2 border-purple-500 text-purple-400"
                        : "text-gray-400 hover:text-gray-300"
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
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={updateForm.firstName}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={updateForm.lastName}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={updateForm.email}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Mobile
                          </label>
                          <input
                            type="tel"
                            name="mobile"
                            value={updateForm.mobile}
                            onChange={handleUpdateChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Address
                          </label>
                          <textarea
                            name="address"
                            value={updateForm.address}
                            onChange={handleUpdateChange}
                            rows="3"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
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
                          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
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
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 6 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
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
                          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
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
          <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4 border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
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
