// frontend/src/components/WellList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import MapPicker from "../components/MapPicker";
import axiosInstance from "../utils/axiosInstance";

const STATUS_OPTIONS = ["Good", "Needs Repair", "Contaminated", "Dry"];
const STATUS_STYLES = {
  Good: "bg-[#4BDA7F]/10 text-[#4BDA7F] border border-[#4BDA7F]/20",
  "Needs Repair": "bg-[#F5BD27]/10 text-[#F5BD27] border border-[#F5BD27]/20",
  Contaminated: "bg-[#CA6162]/10 text-[#CA6162] border border-[#CA6162]/20",
  Dry: "bg-[#6B7280]/10 text-[#6B7280] border border-[#6B7280]/20",
};

export default function WellList() {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedWell, setSelectedWell] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (status) params.set("status", status);
      if (search) params.set("search", search);

      const res = await axiosInstance.get(`/wells?${params}`);
      setWells(res.data.data.wells);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wells");
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
    axiosInstance
      .get(`/wells/${selectedWell._id}/weather`)
      .then((res) => setWeather(res.data.data))
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
      await axiosInstance.delete(`/wells/${id}`);
      toast.success("Well deleted successfully");
      setSelectedWell(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete well");
    }
  };

  const photoUrl = (url) =>
    url?.startsWith("http")
      ? url
      : `${import.meta.env.VITE_API_URL || "http://localhost:5001"}${url}`;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Wells & Weather
          </h1>
          <p className="text-[#9BA0A6] text-sm mt-1">
            Monitor and manage all water wells in your area
          </p>
        </div>
        <Link
          to="/wells/add"
          className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Well
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#CA6162]/10 border border-[#CA6162]/20 text-[#CA6162] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <form
        onSubmit={onSearch}
        className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4"
      >
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search by well name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#101624] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
            />
          </div>
          <div className="w-48">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-[#101624] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold rounded-lg transition-all duration-300"
          >
            Search
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading ? (
        <div className="bg-[#101624] rounded-xl border border-[#172431] p-12 text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-[#F5BD27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#9BA0A6]">Loading wells data...</p>
          </div>
        </div>
      ) : wells.length === 0 ? (
        /* Empty State */
        <div className="bg-[#101624] rounded-xl border border-[#172431] p-12 text-center">
          <svg
            className="w-20 h-20 mx-auto text-[#6B7280] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Wells Found
          </h3>
          <p className="text-[#9BA0A6] mb-6">
            Get started by adding your first monitoring well
          </p>
          <Link
            to="/wells/add"
            className="inline-flex items-center gap-2 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-6 py-2.5 rounded-lg transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Your First Well
          </Link>
        </div>
      ) : (
        /* Main Content Grid */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Wells List Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0A0E19] border-b border-[#172431]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                        Well Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                        Last Inspected
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-[#9BA0A6] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172431]">
                    {wells.map((w) => (
                      <tr
                        key={w._id}
                        onClick={() => setSelectedWell(w)}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedWell?._id === w._id
                            ? "bg-[#F5BD27]/5 border-l-2 border-l-[#F5BD27]"
                            : "hover:bg-[#0A0E19]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">
                            {w.name}
                          </div>
                          <div className="text-xs text-[#6B7280] mt-1">
                            ID: {w._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#9BA0A6] font-mono">
                            {w.location?.lat?.toFixed(4)}°,{" "}
                            {w.location?.lng?.toFixed(4)}°
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_STYLES[w.status] || STATUS_STYLES.Dry
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#9BA0A6]">
                            {w.lastInspected
                              ? new Date(w.lastInspected).toLocaleDateString()
                              : "Not inspected"}
                          </div>
                        </td>
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="px-6 py-4 text-right"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/wells/${w._id}`}
                              className="p-2 text-[#9BA0A6] hover:text-[#F5BD27] transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(w._id, w.name)}
                              className="p-2 text-[#9BA0A6] hover:text-[#CA6162] transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 bg-[#0A0E19] rounded-xl border border-[#172431] px-4 py-3">
                <div className="text-sm text-[#9BA0A6]">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-[#101624] text-[#9BA0A6] rounded-lg hover:bg-[#172431] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-[#101624] text-[#9BA0A6] rounded-lg hover:bg-[#172431] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white px-2">
              Well Details
            </h2>

            {selectedWell ? (
              <>
                {/* Map Card */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                  <div className="p-4 border-b border-[#172431]">
                    <h3 className="font-semibold text-white">Location Map</h3>
                  </div>
                  <div className="p-4">
                    <MapPicker
                      lat={selectedWell.location?.lat}
                      lng={selectedWell.location?.lng}
                      height="200px"
                    />
                  </div>
                </div>

                {/* Photos Card */}
                {selectedWell.photos?.length > 0 && (
                  <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                    <div className="p-4 border-b border-[#172431]">
                      <h3 className="font-semibold text-white">
                        Photos ({selectedWell.photos.length})
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {selectedWell.photos.map((photo, i) => (
                          <a
                            key={i}
                            href={photoUrl(photo)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group overflow-hidden rounded-lg border border-[#172431] hover:border-[#F5BD27] transition-all duration-300"
                          >
                            <img
                              src={photoUrl(photo)}
                              alt={`Well ${i + 1}`}
                              className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Weather Card */}
                <div className="bg-[#101624] rounded-xl border border-[#172431] overflow-hidden">
                  <div className="p-4 border-b border-[#172431]">
                    <h3 className="font-semibold text-white">
                      Weather Information
                    </h3>
                  </div>
                  <div className="p-4">
                    {weatherLoading && !weather ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-3 border-[#F5BD27] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : weather ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">Well</span>
                          <span className="text-sm font-medium text-white">
                            {weather.wellName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">
                            Condition
                          </span>
                          <span className="text-sm font-medium text-white capitalize">
                            {weather.summary?.weather || "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">
                            Temperature
                          </span>
                          <span className="text-sm font-medium text-white">
                            {weather.summary?.temperature != null
                              ? `${Math.round(weather.summary.temperature)}°C`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">
                            Humidity
                          </span>
                          <span className="text-sm font-medium text-white">
                            {weather.summary?.humidity != null
                              ? `${weather.summary.humidity}%`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">
                            Rainfall
                          </span>
                          <span className="text-sm font-medium text-white">
                            {weather.summary?.rainfallMm != null
                              ? `${weather.summary.rainfallMm} mm`
                              : "0 mm"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9BA0A6]">
                            Water Level Trend
                          </span>
                          <span className="text-sm font-medium text-white capitalize">
                            {weather.summary?.waterLevelTrend || "—"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto text-[#6B7280] mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                          />
                        </svg>
                        <p className="text-[#9BA0A6] text-sm">
                          Weather data unavailable
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Link
                  to={`/wells/${selectedWell._id}`}
                  className="flex items-center justify-center gap-2 w-full bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold px-4 py-2.5 rounded-lg transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Well Details
                </Link>
              </>
            ) : (
              <div className="bg-[#101624] rounded-xl border border-[#172431] p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-[#6B7280] mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#9BA0A6]">
                  Select a well from the list to view detailed information,
                  photos, and weather data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
