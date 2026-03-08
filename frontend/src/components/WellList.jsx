import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const STATUS_OPTIONS = ['Good', 'Needs Repair', 'Contaminated', 'Dry'];
const STATUS_STYLES = {
  Good: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Needs Repair': 'bg-amber-100 text-amber-800 border-amber-200',
  Contaminated: 'bg-rose-100 text-rose-800 border-rose-200',
  Dry: 'bg-slate-100 text-slate-700 border-slate-200',
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
        <h1 className="font-display font-bold text-2xl text-slate-900">Wells</h1>
        <Link to="/wells/add" className="btn-primary shrink-0">
          Add well
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={onSearch} className="flex flex-wrap gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-48"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field w-40"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <div className="card p-12 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
          <p className="mt-3">Loading wells…</p>
        </div>
      ) : wells.length === 0 ? (
        <div className="card p-12 text-center text-slate-500 animate-fade-in">
          No wells found. <Link to="/wells/add" className="text-ocean-600 font-medium hover:underline">Add one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Last inspected</th>
                      <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wells.map((w) => (
                      <tr
                        key={w._id}
                        onClick={() => setSelectedWell(w)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          selectedWell?._id === w._id ? 'bg-ocean-50/70' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-4 font-medium text-slate-900">{w.name}</td>
                        <td className="p-4 text-slate-600 text-sm">
                          {w.location?.lat?.toFixed(4)}, {w.location?.lng?.toFixed(4)}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_STYLES[w.status] || STATUS_STYLES.Dry}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {w.lastInspected ? new Date(w.lastInspected).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <Link to={`/wells/${w._id}`} className="btn-ghost text-ocean-600 mr-2">Edit</Link>
                          <button type="button" onClick={() => handleDelete(w._id, w.name)} className="btn-ghost text-coral-600 hover:bg-rose-50">
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
              <div className="flex items-center gap-3 mt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-ghost disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-ghost disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="font-display font-semibold text-slate-900">Details</h2>
            {selectedWell ? (
              <>
                <div className="card overflow-hidden p-0">
                  <MapPicker lat={selectedWell.location?.lat} lng={selectedWell.location?.lng} height="180px" />
                </div>
                {selectedWell.photos?.length > 0 && (
                  <div className="card p-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Photos</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedWell.photos.map((url, i) => (
                        <a key={i} href={photoUrl(url)} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 hover:border-ocean-300 transition-colors">
                          <img src={photoUrl(url)} alt={`Well ${i + 1}`} className="h-16 w-16 object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="card p-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Weather</h3>
                  {weatherLoading && !weather ? (
                    <p className="text-sm text-slate-500">Loading…</p>
                  ) : weather ? (
                    <div className="text-sm text-slate-600 space-y-1.5">
                      <p className="font-medium text-slate-800">{weather.wellName}</p>
                      <p className="capitalize">{weather.summary?.weather || '—'}</p>
                      <p>
                        {weather.summary?.temperature != null && `${Math.round(weather.summary.temperature)}°C`}
                        {weather.summary?.humidity != null && ` · ${weather.summary.humidity}% humidity`}
                      </p>
                      <p>Rain: {weather.summary?.rainfallMm != null ? `${weather.summary.rainfallMm} mm` : '0 mm'}</p>
                      <p className="capitalize">Trend: {weather.summary?.waterLevelTrend || '—'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Weather unavailable.</p>
                  )}
                </div>
                <Link to={`/wells/${selectedWell._id}`} className="btn-secondary w-full justify-center">
                  Edit this well
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a well to see details, photos, and weather.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
