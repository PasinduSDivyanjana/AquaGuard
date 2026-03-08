import { Routes, Route, Link, useLocation } from 'react-router-dom';
import WellList from './components/WellList';
import AddWell from './components/AddWell';
import EditWell from './components/EditWell';
import AppBackground from './components/AppBackground';
import HeroGraphic from './components/HeroGraphic';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative">
      <AppBackground />
      <header className="sticky top-0 z-50 border-b border-ocean-200/60 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-display font-bold text-xl text-ocean-700 tracking-tight hover:text-ocean-800 transition-colors flex items-center gap-2"
          >
            <span className="text-2xl" aria-hidden>💧</span>
            AquaGuard
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'bg-ocean-100 text-ocean-700' : 'text-slate-600 hover:bg-ocean-50 hover:text-ocean-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/wells"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname.startsWith('/wells') ? 'bg-ocean-100 text-ocean-700' : 'text-slate-600 hover:bg-ocean-50 hover:text-ocean-700'
              }`}
            >
              Wells
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 animate-fade-in">
        <Routes>
          <Route
            path="/"
            element={
              <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center relative">
                <HeroGraphic />
                <div className="animate-slide-up max-w-2xl mx-auto">
                  <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 mb-4">
                    Rural water well monitoring
                  </h1>
                  <p className="text-lg text-slate-600 mb-10">
                    Track wells, conditions, and weather in one place.
                  </p>
                  <Link to="/wells" className="btn-primary text-base px-8 py-3">
                    View wells
                  </Link>
                </div>
              </div>
            }
          />
          <Route path="/wells" element={<WellList />} />
          <Route path="/wells/add" element={<AddWell />} />
          <Route path="/wells/:id" element={<EditWell />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
