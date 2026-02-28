import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const STATUS_OPTIONS = ['Good', 'Needs Repair', 'Contaminated', 'Dry'];
const STATUS_CLASS = {
  Good: 'bg-green-100 text-green-800',
  'Needs Repair': 'bg-amber-100 text-amber-800',
  Contaminated: 'bg-red-100 text-red-800',
  Dry: 'bg-slate-200 text-slate-700',
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
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Wells</h1>
          <Link
            to="/wells/add"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Well
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={onSearch} className="flex gap-2 mb-6 flex-wrap">
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-48"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 rounded-lg px-3 py-2"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-slate-500 py-12 text-center">Loading wells...</div>
        ) : wells.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            No wells found. <Link to="/wells/add" className="text-teal-600 hover:underline">Add one</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-700">Name</th>
                      <th className="text-left p-3 font-medium text-slate-700">Location</th>
                      <th className="text-left p-3 font-medium text-slate-700">Status</th>
                      <th className="text-left p-3 font-medium text-slate-700">Last Inspected</th>
                      <th className="text-left p-3 font-medium text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wells.map((w) => (
                      <tr
                        key={w._id}
                        onClick={() => setSelectedWell(w)}
                        className={`border-t border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${selectedWell?._id === w._id ? 'bg-teal-50' : ''}`}
                      >
                        <td className="p-3">{w.name}</td>
                        <td className="p-3 text-slate-600">
                          {w.location?.lat?.toFixed(4)}, {w.location?.lng?.toFixed(4)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${STATUS_CLASS[w.status] || STATUS_CLASS.Dry}`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {w.lastInspected
                            ? new Date(w.lastInspected).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/wells/${w._id}`}
                            className="text-teal-600 hover:underline mr-3"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(w._id, w.name)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex gap-2 mt-4 items-center">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-100"
                  >
                    Prev
                  </button>
                  <span className="text-slate-600">Page {page} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-slate-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Well Details</h2>
              {selectedWell ? (
                <>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <MapPicker
                      lat={selectedWell.location?.lat}
                      lng={selectedWell.location?.lng}
                      height="180px"
                    />
                  </div>

                  {selectedWell.photos?.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Photos</h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedWell.photos.map((url, i) => (
                          <a
                            key={i}
                            href={photoUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={photoUrl(url)}
                              alt={`Well ${i + 1}`}
                              className="h-16 w-16 object-cover rounded-lg border border-slate-200 hover:opacity-90"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">OpenWeather</h3>
                    {weatherLoading && !weather ? (
                      <p className="text-sm text-slate-500">Loading weather…</p>
                    ) : weather ? (
                      <div className="text-sm text-slate-600 space-y-1">
                        <p className="font-medium text-slate-800">{weather.wellName}</p>
                        <p className="capitalize">{weather.summary?.weather || '—'}</p>
                        <p>
                          {weather.summary?.temperature != null && `${Math.round(weather.summary.temperature)}°C`}
                          {weather.summary?.humidity != null && ` · Humidity ${weather.summary.humidity}%`}
                        </p>
                        <p>Rain: {weather.summary?.rainfallMm != null ? `${weather.summary.rainfallMm} mm` : '0 mm'}</p>
                        <p className="capitalize">Water level trend: {weather.summary?.waterLevelTrend || '—'}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Weather unavailable.</p>
                    )}
                  </div>

                  <Link
                    to={`/wells/${selectedWell._id}`}
                    className="block text-center text-teal-600 hover:underline font-medium"
                  >
                    Edit this well →
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-500">Click a well row to see details, photos, and weather.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
