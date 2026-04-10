import { Routes, Route } from "react-router";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import ReportDetail from "./pages/ReportDetail";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateReport />} />
          <Route path="/report/:id" element={<ReportDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
