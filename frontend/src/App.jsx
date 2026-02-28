import { Routes, Route, Link } from "react-router-dom";
import WellList from "./components/WellList";
import AddWell from "./components/AddWell";
import EditWell from "./components/EditWell";

function App() {
  return (
    <div>
      <nav className="bg-teal-700 text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link to="/" className="font-bold text-lg">
            AquaGuard
          </Link>
          <Link to="/wells" className="hover:underline">
            Wells
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">AquaGuard</h1>
            <p className="text-slate-600 mb-6">Rural Water Well Monitoring</p>
            <Link
              to="/wells"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              View Wells
            </Link>
          </div>
        } />
        <Route path="/wells" element={<WellList />} />
        <Route path="/wells/add" element={<AddWell />} />
        <Route path="/wells/:id" element={<EditWell />} />
      </Routes>
    </div>
  );
}

export default App;
