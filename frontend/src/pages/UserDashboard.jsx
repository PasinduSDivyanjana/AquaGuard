// UserDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Welcome to Your Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Profile Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">John Doe</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">john@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NIC</p>
                  <p className="font-medium text-gray-800">123456789V</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium text-gray-800">0712345678</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium text-gray-800">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      User
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-800">
                    January 1, 2024
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Email Verified</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Yes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition duration-200">
                View Profile
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition duration-200">
                Settings
              </button>
              <Link
                to="/login"
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition duration-200 text-center"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
