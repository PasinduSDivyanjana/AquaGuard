import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        console.log(res.data); // 🔍 debug (remove later)

        setUser(res.data.data); // adjust if your backend differs
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Full name helper
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* Welcome */}
          <h2 className="text-2xl font-bold mb-6">
            Welcome, {fullName || "User"} 👋
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">
                Profile Information
              </h3>

              <div className="space-y-2 text-gray-700">
                <p>
                  <b>Name:</b> {fullName}
                </p>
                <p>
                  <b>Email:</b> {user?.email}
                </p>
                <p>
                  <b>NIC:</b> {user?.nic}
                </p>
                <p>
                  <b>Mobile:</b> {user?.mobile}
                </p>
                <p>
                  <b>Address:</b> {user?.address}
                </p>
                <p>
                  <b>Gender:</b> {user?.gender}
                </p>
                <p>
                  <b>Date of Birth:</b>{" "}
                  {user?.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                </p>
                <p>
                  <b>Role:</b>{" "}
                  <span className="bg-purple-200 px-2 py-1 rounded text-sm">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">Account Status</h3>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="bg-green-200 px-2 py-1 rounded text-sm">
                    Active
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Email Verified</span>
                  <span className="bg-green-200 px-2 py-1 rounded text-sm">
                    {user?.isVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Joined</span>
                  <span>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded">
              View Profile
            </button>

            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
