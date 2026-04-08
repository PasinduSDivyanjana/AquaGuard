import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TasksList } from './pages/TasksList';
import { AlertsManagement } from './pages/AlertsManagement';
import { AutoTasksApproval } from './pages/AutoTasksApproval';
import { WellsAndWeather } from './pages/WellsAndWeather';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes wrapped in Layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TasksList />} />
        <Route path="alerts" element={<AlertsManagement />} />
        <Route path="auto-tasks" element={<AutoTasksApproval />} />
        <Route path="wells" element={<WellsAndWeather />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
