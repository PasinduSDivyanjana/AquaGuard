import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MapPicker from "../components/MapPicker";
import axiosInstance from "../utils/axiosInstance";
import {
  Save,
  X,
  MapPin,
  Droplets,
  Thermometer,
  Wind,
  CloudRain,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const STATUS_OPTIONS = ["Good", "Needs Repair", "Contaminated", "Dry"];

const STATUS_STYLES = {
  Good: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  "Needs Repair": {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  Contaminated: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  Dry: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: <Droplets className="w-3.5 h-3.5" />,
  },
};

export default function EditWell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
    status: "Good",
  });
  const [photos, setPhotos] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await axiosInstance.get(`/wells/${id}`);
        const w = res.data.data;
        setForm({
          name: w.name || "",
          lat: w.location?.lat ?? "",
          lng: w.location?.lng ?? "",
          status: w.status || "Good",
        });
        setPhotos(w.photos || []);
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Well not found";
        setError(msg);
        toast.error("Failed to load well");
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
    axiosInstance
      .get(`/wells/${id}/weather`)
      .then((res) => setWeather(res.data.data))
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
    setError("");
    if (!form.name.trim()) {
      setError("Well name is required");
      toast.error("Well name is required");
      return;
    }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("Valid latitude (-90 to 90) required");
      toast.error("Valid latitude (-90 to 90) required");
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError("Valid longitude (-180 to 180) required");
      toast.error("Valid longitude (-180 to 180) required");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/wells/${id}`, {
        name: form.name.trim(),
        location: { lat, lng },
        status: form.status,
      });
      toast.success("Well updated successfully!");
      navigate("/userDashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update well";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/wells/${id}`);
      toast.success("Well deleted successfully");
      navigate("/userDashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete well";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const photoUrl = (url) =>
    url?.startsWith("http") ? url : `${API_URL}${url}`;
  const currentStatusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.Good;

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#F5BD27]/20 border-t-[#F5BD27] rounded-full animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#F5BD27]/20 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-[#9BA0A6] font-medium">Loading well details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5BD27]/10 rounded-full mb-4">
            <div className="w-2 h-2 bg-[#F5BD27] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#F5BD27] uppercase tracking-wider">
              Well Management
            </span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Edit Well
              </h1>
              <p className="text-[#9BA0A6] text-sm">
                Update location, status, and monitor live weather conditions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-[#0A0E19] border border-[#172431]">
                <span className="text-xs font-mono text-[#9BA0A6]">
                  ID: {id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}
              >
                {currentStatusStyle.icon}
                {form.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 rounded-xl p-4 animate-slide-down">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Well Name Card */}
              <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
                <label className="block text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-3">
                  Well Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter well name..."
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  required
                />
              </div>

              {/* Location Card */}
              <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#F5BD27]" />
                  <label className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider">
                    Location
                  </label>
                </div>

                <MapPicker
                  lat={form.lat}
                  lng={form.lng}
                  onChange={handleMapPick}
                  height="280px"
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="lat"
                      value={form.lat}
                      onChange={handleChange}
                      placeholder="e.g., 6.9271"
                      className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-all font-mono text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9BA0A6] mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="lng"
                      value={form.lng}
                      onChange={handleChange}
                      placeholder="e.g., 79.8612"
                      className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-all font-mono text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
                <label className="block text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-3">
                  Well Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {STATUS_OPTIONS.map((status) => {
                    const style = STATUS_STYLES[status];
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setForm({ ...form, status })}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                          form.status === status
                            ? `${style.bg} ${style.text} ${style.border}`
                            : "border-[#172431] bg-[#0A0E19] text-[#9BA0A6] hover:border-[#F5BD27]/40"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          {style.icon}
                          <span className="text-xs font-semibold">
                            {status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#F5BD27] to-[#E6C27A] hover:from-[#E6C27A] hover:to-[#F5BD27] text-[#0A0E19] font-bold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/userDashboard")}
                  className="px-6 py-3 bg-[#172431] hover:bg-[#1a2a3a] text-white rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>

              {/* Delete Button */}
              <div className="pt-4 border-t border-[#172431]">
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Delete Well
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-sm font-semibold text-red-300">
                        Delete this well?
                      </p>
                    </div>
                    <p className="text-xs text-[#9BA0A6] mb-4">
                      This action cannot be undone. All data associated with
                      this well will be permanently removed.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {deleteLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Confirm Delete"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2 bg-[#172431] hover:bg-[#1a2a3a] text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - Photos & Weather */}
          <div className="space-y-6">
            {/* Photos Card */}
            {photos.length > 0 && (
              <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-[#F5BD27]" />
                  <h3 className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider">
                    Photos ({photos.length})
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <a
                      key={i}
                      href={photoUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-xl border border-[#172431] hover:border-[#F5BD27] transition-all duration-300"
                    >
                      <img
                        src={photoUrl(url)}
                        alt={`Well ${i + 1}`}
                        className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Weather Card */}
            <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-2xl border border-[#172431] p-6 hover:border-[#F5BD27]/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#F5BD27]/10">
                    <CloudRain className="w-4 h-4 text-[#F5BD27]" />
                  </div>
                  <h3 className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider">
                    Live Weather Data
                  </h3>
                </div>
                {weatherLoading && (
                  <RefreshCw className="w-3.5 h-3.5 text-[#F5BD27] animate-spin" />
                )}
              </div>

              {weatherLoading && !weather ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#F5BD27] animate-spin" />
                </div>
              ) : weather ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#172431]">
                    <span className="text-xs text-[#9BA0A6]">Location</span>
                    <span className="text-sm text-white font-medium">
                      {weather.wellName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-[#F5BD27]" />
                      <span className="text-xs text-[#9BA0A6]">
                        Temperature
                      </span>
                    </div>
                    <span className="text-sm text-white">
                      {weather.summary?.temperature != null
                        ? `${Math.round(weather.summary.temperature)}°C`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-[#F5BD27]" />
                      <span className="text-xs text-[#9BA0A6]">Humidity</span>
                    </div>
                    <span className="text-sm text-white">
                      {weather.summary?.humidity != null
                        ? `${weather.summary.humidity}%`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-3.5 h-3.5 text-[#F5BD27]" />
                      <span className="text-xs text-[#9BA0A6]">Rainfall</span>
                    </div>
                    <span className="text-sm text-white">
                      {weather.summary?.rainfallMm != null
                        ? `${weather.summary.rainfallMm} mm`
                        : "0 mm"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-[#F5BD27]" />
                      <span className="text-xs text-[#9BA0A6]">
                        Water Level Trend
                      </span>
                    </div>
                    <span className="text-sm text-white capitalize">
                      {weather.summary?.waterLevelTrend || "—"}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#172431]">
                    <p className="text-xs text-[#6B7280] capitalize">
                      {weather.summary?.weather || "No weather data available"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#6B7280]">
                    Weather data unavailable
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Select coordinates to fetch weather
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add animation keyframes if not already present */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
