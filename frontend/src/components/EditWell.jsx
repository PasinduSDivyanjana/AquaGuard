import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const STATUS_OPTIONS = ['Good', 'Needs Repair', 'Contaminated', 'Dry'];

export default function EditWell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', status: 'Good' });
  const [photos, setPhotos] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${API_URL}/api/wells/${id}`, { headers: { 'Content-Type': 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Well not found');
        const w = data.data;
        setForm({ name: w.name || '', lat: w.location?.lat ?? '', lng: w.location?.lng ?? '', status: w.status || 'Good' });
        setPhotos(w.photos || []);
      } catch (err) {
        setError(err.message || 'Well not found');
        toast.error('Failed to load well');
      } finally {
        setFetching(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!id || !form.lat || !form.lng) return;
    setWeatherLoading(true);
    setWeather(null);
    fetch(`${API_URL}/api/wells/${id}/weather`)
      .then((r) => r.json())
      .then((d) => setWeather(d.data))
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [id, form.lat, form.lng]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapPick = (lat, lng) => {
    setForm((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Well name is required');
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Valid latitude (-90 to 90) required');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('Valid longitude (-180 to 180) required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wells/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), location: { lat, lng }, status: form.status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update well');
      toast.success('Well updated');
      navigate('/wells');
    } catch (err) {
      setError(err.message || 'Failed to update well');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const photoUrl = (url) => (url?.startsWith('http') ? url : `${API_URL}${url}`);

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-slate-500 flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
          <p>Loading well…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-slide-up">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Edit well</h1>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm border border-rose-200">{error}</div>
          )}

          <div>
            <label className="label">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" required />
          </div>

          <div>
            <label className="label">Location</label>
            <MapPicker lat={form.lat} lng={form.lng} onChange={handleMapPick} height="200px" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-slate-500 mb-0.5 block">Latitude</label>
                <input type="text" name="lat" value={form.lat} onChange={handleChange} className="input-field text-sm" required />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-0.5 block">Longitude</label>
                <input type="text" name="lng" value={form.lng} onChange={handleChange} className="input-field text-sm" required />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => navigate('/wells')} className="btn-ghost">Cancel</button>
          </div>
        </form>

        {photos.length > 0 && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Photos</h3>
            <div className="flex gap-2 flex-wrap">
              {photos.map((url, i) => (
                <a key={i} href={photoUrl(url)} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-slate-200 hover:border-ocean-300 transition-colors">
                  <img src={photoUrl(url)} alt={`Well ${i + 1}`} className="h-20 w-20 object-cover" />
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
      </div>
    </div>
  );
}
