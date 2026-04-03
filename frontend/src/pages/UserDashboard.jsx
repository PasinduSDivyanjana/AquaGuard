import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user profile using token
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        setUser(res.data.user); // adjust based on backend response
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Proper logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Welcome, {user?.name || "User"} 👋
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Profile Information</h3>

              <div className="space-y-2">
                <p>
                  <b>Name:</b> {user?.name}
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
                  <b>Role:</b>{" "}
                  <span className="bg-purple-200 px-2 py-1 rounded">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Account Status</h3>

              <div className="space-y-2">
                <p>
                  <b>Status:</b>{" "}
                  <span className="bg-green-200 px-2 py-1 rounded">Active</span>
                </p>
                <p>
                  <b>Email Verified:</b> Yes
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <button className="bg-purple-500 text-white py-2 rounded">
              View Profile
            </button>

            <button className="bg-blue-500 text-white py-2 rounded">
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 rounded"
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
