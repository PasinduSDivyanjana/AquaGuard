import { Routes, Route, Link, useLocation } from 'react-router-dom';
import WellList from './components/WellList';
import AddWell from './components/AddWell';
import EditWell from './components/EditWell';
import AppBackground from './components/AppBackground';
import Dashboard from './components/Dashboard';

function App() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <AppBackground />

      <aside className="sidebar">
        <div className="brand">
          <span aria-hidden>💧</span>
          <span>AquaGuard</span>
        </div>

        <nav>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/wells" className={`nav-link ${location.pathname.startsWith('/wells') ? 'active' : ''}`}>
            Wells & Weather
          </Link>
          <Link to="/wells/add" className={`nav-link ${location.pathname === '/wells/add' ? 'active' : ''}`}>
            Add Well
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-ghost" style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </aside>

      <section className="main-area">
        <div className="topbar">
          <input className="topbar-search" placeholder="Search wells, tasks, alerts..." />
          <div className="system-badge">System Normal</div>
        </div>

        <main className="content-wrap">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wells" element={<WellList />} />
            <Route path="/wells/add" element={<AddWell />} />
            <Route path="/wells/:id" element={<EditWell />} />
          </Routes>
        </main>
      </section>
    </div>
  );
}

export default App;
