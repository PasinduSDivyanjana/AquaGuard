import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import { Dashboard } from './pages/Dashboard';
import { TasksList } from './pages/TasksList';
import { AlertsManagement } from './pages/AlertsManagement';
import { AutoTasksApproval } from './pages/AutoTasksApproval';
import { WellsAndWeather } from './pages/WellsAndWeather';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/userDashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/adminDashboard" element={<AdminDashboard />} /> */}
        <Route
          path="/adminDashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/tasks" element={<TasksList />} />
        <Route path="/alerts" element={<AlertsManagement />} />
        <Route path="/auto-tasks" element={<AutoTasksApproval />} />
        <Route path="/wells" element={<WellsAndWeather />} />
        <Route path="/dahboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
