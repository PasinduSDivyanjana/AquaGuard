import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapPicker from './MapPicker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const STATUS_OPTIONS = ['Good', 'Needs Repair', 'Contaminated', 'Dry'];

export default function AddWell() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', status: 'Good' });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapPick = (lat, lng) => {
    setForm((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
  };

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files || []).slice(0, 5));
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
      if (photos.length > 0) {
        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('lat', lat);
        fd.append('lng', lng);
        fd.append('status', form.status);
        photos.forEach((f) => fd.append('photos', f));
        const res = await fetch(`${API_URL}/api/wells`, { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to create well');
      } else {
        const res = await fetch(`${API_URL}/api/wells`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name.trim(), lat, lng, status: form.status }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to create well');
      }
      toast.success('Well created');
      navigate('/wells');
    } catch (err) {
      setError(err.message || 'Failed to create well');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-slide-up">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">Add well</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm border border-rose-200">{error}</div>
        )}

        <div>
          <label className="label">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Village Well #1"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Location</label>
          <MapPicker lat={form.lat} lng={form.lng} onChange={handleMapPick} height="200px" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs text-slate-500 mb-0.5 block">Latitude</label>
              <input type="text" name="lat" value={form.lat} onChange={handleChange} placeholder="13.7563" className="input-field text-sm" required />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-0.5 block">Longitude</label>
              <input type="text" name="lng" value={form.lng} onChange={handleChange} placeholder="100.5018" className="input-field text-sm" required />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Photos (optional, max 5)</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            multiple
            onChange={handlePhotoChange}
            className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-ocean-50 file:text-ocean-700 file:font-medium hover:file:bg-ocean-100 file:transition-colors"
          />
          {photos.length > 0 && <p className="text-xs text-slate-500 mt-1">{photos.length} selected</p>}
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
            {loading ? 'Creating…' : 'Create well'}
          </button>
          <button type="button" onClick={() => navigate('/wells')} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
