import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const STATUS_OPTIONS = ['Good', 'Needs Repair', 'Contaminated', 'Dry'];
const STATUS_STYLES = {
  Good: 'badge badge-good',
  'Needs Repair': 'badge badge-repair',
  Contaminated: 'badge badge-bad',
  Dry: 'badge badge-dry',
};

export default function WellList() {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedWell, setSelectedWell] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`${API_URL}/api/wells?${params}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to load wells');
      setWells(data.data.wells);
      setTotalPages(data.data.totalPages);
    } catch (err) {
      setError(err.message || 'Failed to load wells');
      setWells([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status]);

  useEffect(() => {
    if (!selectedWell) {
      setWeather(null);
      return;
    }
    setWeatherLoading(true);
    setWeather(null);
    fetch(`${API_URL}/api/wells/${selectedWell._id}/weather`)
      .then((r) => r.json())
      .then((d) => setWeather(d.data))
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [selectedWell?._id]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete well "${name}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/wells/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to delete well');
      toast.success('Well deleted');
      setSelectedWell(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete well');
    }
  };

  const photoUrl = (url) => (url?.startsWith('http') ? url : `${API_URL}${url}`);

  return (
    <div style={{ padding: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h1 className="home-title" style={{ marginBottom: 0 }}>Wells & Weather</h1>
        <Link to="/wells/add" className="btn-primary">Add well</Link>
      </div>

      {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

      <form onSubmit={onSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{ width: 240 }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field"
          style={{ width: 170 }}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <div className="card" style={{ padding: 34, textAlign: 'center' }}>
          <p className="muted">Loading wells…</p>
        </div>
      ) : wells.length === 0 ? (
        <div className="card" style={{ padding: 34, textAlign: 'center' }}>
          <span className="muted">No wells found. </span>
          <Link to="/wells/add" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Add one</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <div>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Last inspected</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wells.map((w) => (
                      <tr
                        key={w._id}
                        onClick={() => setSelectedWell(w)}
                        className={`row-hover ${selectedWell?._id === w._id ? 'row-active' : ''}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 600 }}>{w.name}</td>
                        <td className="muted">{w.location?.lat?.toFixed(4)}, {w.location?.lng?.toFixed(4)}</td>
                        <td><span className={STATUS_STYLES[w.status] || STATUS_STYLES.Dry}>{w.status}</span></td>
                        <td className="muted">{w.lastInspected ? new Date(w.lastInspected).toLocaleDateString() : '—'}</td>
                        <td onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                          <Link to={`/wells/${w._id}`} className="btn-ghost">Edit</Link>
                          <button type="button" onClick={() => handleDelete(w._id, w.name)} className="btn-ghost" style={{ color: '#ffb5b6' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost" style={{ opacity: page <= 1 ? 0.4 : 1 }}>Previous</button>
                <span className="muted">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost" style={{ opacity: page >= totalPages ? 0.4 : 1 }}>Next</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontFamily: 'Outfit, system-ui, sans-serif' }}>Details</h2>
            {selectedWell ? (
              <>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <MapPicker lat={selectedWell.location?.lat} lng={selectedWell.location?.lng} height="180px" />
                </div>

                {selectedWell.photos?.length > 0 && (
                  <div className="card" style={{ padding: 12 }}>
                    <h3 className="muted" style={{ margin: '0 0 8px 0' }}>Photos</h3>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selectedWell.photos.map((url, i) => (
                        <a key={i} href={photoUrl(url)} target="_blank" rel="noopener noreferrer" style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)' }}>
                          <img src={photoUrl(url)} alt={`Well ${i + 1}`} style={{ height: 68, width: 68, objectFit: 'cover' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card" style={{ padding: 12 }}>
                  <h3 className="muted" style={{ margin: '0 0 8px 0' }}>Weather</h3>
                  {weatherLoading && !weather ? (
                    <p className="muted">Loading…</p>
                  ) : weather ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{weather.wellName}</p>
                      <p className="muted" style={{ margin: 0, textTransform: 'capitalize' }}>{weather.summary?.weather || '—'}</p>
                      <p style={{ margin: 0 }}>
                        {weather.summary?.temperature != null && `${Math.round(weather.summary.temperature)}°C`}
                        {weather.summary?.humidity != null && ` · ${weather.summary.humidity}% humidity`}
                      </p>
                      <p style={{ margin: 0 }}>Rain: {weather.summary?.rainfallMm != null ? `${weather.summary.rainfallMm} mm` : '0 mm'}</p>
                      <p className="muted" style={{ margin: 0, textTransform: 'capitalize' }}>Trend: {weather.summary?.waterLevelTrend || '—'}</p>
                    </div>
                  ) : (
                    <p className="muted">Weather unavailable.</p>
                  )}
                </div>

                <Link to={`/wells/${selectedWell._id}`} className="btn-secondary" style={{ width: '100%' }}>
                  Edit this well
                </Link>
              </>
            ) : (
              <p className="muted">Select a well to see details, photos, and weather.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
