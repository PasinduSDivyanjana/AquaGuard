import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroGraphic from '../components/HeroGraphic';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function KpiValue({ value, loading }) {
  if (loading) {
    return <div className="kpi-value kpi-value--loading" aria-hidden />;
  }
  return <div className="kpi-value">{value ?? '—'}</div>;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: null,
    needsRepair: null,
    contaminated: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [resAll, resRepair, resBad] = await Promise.all([
          fetch(`${API_URL}/api/wells?page=1&limit=1`),
          fetch(`${API_URL}/api/wells?page=1&limit=1&status=${encodeURIComponent('Needs Repair')}`),
          fetch(`${API_URL}/api/wells?page=1&limit=1&status=${encodeURIComponent('Contaminated')}`),
        ]);
        const [dAll, dRepair, dBad] = await Promise.all([
          resAll.json().catch(() => ({})),
          resRepair.json().catch(() => ({})),
          resBad.json().catch(() => ({})),
        ]);
        if (cancelled) return;
        setStats({
          total: dAll.data?.total ?? null,
          needsRepair: dRepair.data?.total ?? null,
          contaminated: dBad.data?.total ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, loading: false }));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const { loading, total, needsRepair, contaminated } = stats;

  return (
    <div className="dashboard-page animate-slide-up">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1 className="home-title" style={{ marginBottom: 6 }}>
            Dashboard
          </h1>
          <p className="home-subtitle" style={{ marginBottom: 0 }}>
            Smart well monitoring — status at a glance
          </p>
        </div>
        <div className="dashboard-header-aside">
          <span className="dashboard-date">{today}</span>
          <div className="dashboard-quick-actions">
            <Link to="/wells" className="btn-secondary">
              View wells
            </Link>
            <Link to="/wells/add" className="btn-primary">
              Add well
            </Link>
          </div>
        </div>
      </header>

      <div className="dashboard-grid dashboard-kpi-strip">
        <div className="kpi-card kpi-card--teal">
          <div className="kpi-card-top">
            <span className="kpi-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            <span className="kpi-label">Monitored wells</span>
          </div>
          <KpiValue value={total} loading={loading} />
          <p className="kpi-hint">Registered in AquaGuard</p>
        </div>

        <div className="kpi-card kpi-card--gold">
          <div className="kpi-card-top">
            <span className="kpi-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span className="kpi-label">Needs repair</span>
          </div>
          <KpiValue value={needsRepair} loading={loading} />
          <p className="kpi-hint">Status: Needs Repair</p>
        </div>

        <div className="kpi-card kpi-card--coral">
          <div className="kpi-card-top">
            <span className="kpi-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span className="kpi-label">Contamination flags</span>
          </div>
          <KpiValue value={contaminated} loading={loading} />
          <p className="kpi-hint">Status: Contaminated</p>
        </div>
      </div>

      <div className="dashboard-hero-grid">
        <div className="card dashboard-hero-visual">
          <div className="dashboard-hero-visual-inner">
            <p className="dashboard-hero-tag">Live network</p>
            <HeroGraphic />
            <p className="dashboard-hero-caption muted">
              Wells are tracked with map coordinates, photos, and weather context for faster decisions.
            </p>
          </div>
        </div>

        <div className="card dashboard-hero-copy">
          <h2 className="dashboard-hero-title">Keep every well visible</h2>
          <p className="muted" style={{ margin: '0 0 14px', lineHeight: 1.55 }}>
            Review the full directory, inspect conditions on the map, and update records when field work is done.
            Weather summaries help you interpret water levels alongside rainfall and trends.
          </p>
          <ul className="dashboard-bullet-list">
            <li>Search and filter by status</li>
            <li>Click a row for map, photos, and forecast</li>
            <li>Edit details or add new sites in a few steps</li>
          </ul>
          <div className="dashboard-hero-footer">
            <Link to="/wells" className="btn-primary">
              Open Wells &amp; Weather
            </Link>
            <span className="subtle dashboard-hero-footnote">CRUD demo · Smart well monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
