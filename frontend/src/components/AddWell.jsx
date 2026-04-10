// frontend/src/components/AddWell.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import MapPicker from "./MapPicker";
import axiosInstance from "../utils/axiosInstance";

const STATUS_OPTIONS = ["Good", "Needs Repair", "Contaminated", "Dry"];
const STATUS_COLORS = {
  Good: "text-[#4BDA7F] bg-[#4BDA7F]/10 border-[#4BDA7F]/20",
  "Needs Repair": "text-[#F5BD27] bg-[#F5BD27]/10 border-[#F5BD27]/20",
  Contaminated: "text-[#CA6162] bg-[#CA6162]/10 border-[#CA6162]/20",
  Dry: "text-[#6B7280] bg-[#6B7280]/10 border-[#6B7280]/20",
};

export default function AddWell({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lng: "",
    status: "Good",
  });
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapPick = (lat, lng) => {
    setForm((prev) => ({ ...prev, lat: String(lat), lng: String(lng) }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
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
      let response;

      if (photos.length > 0) {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("lat", lat);
        fd.append("lng", lng);
        fd.append("status", form.status);
        photos.forEach((f) => fd.append("photos", f));

        response = await axiosInstance.post("/wells", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post("/wells", {
          name: form.name.trim(),
          lat,
          lng,
          status: form.status,
        });
      }

      if (response.data.success) {
        toast.success("Well created successfully! 🎉");
        if (onSuccess) onSuccess(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create well";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[#101624] rounded-2xl border border-[#172431] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#0A0E19] to-[#101624] p-8 border-b border-[#172431]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5BD27]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5BD27]/10 rounded-full mb-4 mx-auto">
              <div className="w-2 h-2 bg-[#F5BD27] rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-[#F5BD27] uppercase tracking-wider">
                Well Management
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Add New Well
            </h1>
            <p className="text-[#9BA0A6] text-base max-w-2xl mx-auto">
              Create a new monitoring point with location, status, and optional
              photos to track water quality and levels.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-w-2xl mx-auto"
        >
          {/* Error Alert */}
          {error && (
            <div className="bg-[#CA6162]/10 border-l-4 border-[#CA6162] p-4 rounded-lg animate-shake">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#CA6162]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#CA6162] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Well Name Section */}
          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 text-sm font-medium text-[#9BA0A6]">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Well Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Village Well #1, Community Borehole"
              className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-2 focus:ring-[#F5BD27]/20 transition-all duration-300 text-center"
              required
            />
            <p className="text-xs text-[#6B7280] text-center">
              Choose a descriptive name for easy identification
            </p>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 text-sm font-medium text-[#9BA0A6]">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Location
            </label>
            <div className="bg-[#0A0E19] rounded-xl border border-[#172431] p-4">
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={handleMapPick}
                height="300px"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9BA0A6] mb-1 text-center">
                  Latitude
                </label>
                <input
                  type="text"
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="e.g., 13.7563"
                  className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-2 focus:ring-[#F5BD27]/20 transition-all duration-300 font-mono text-center"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9BA0A6] mb-1 text-center">
                  Longitude
                </label>
                <input
                  type="text"
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="e.g., 100.5018"
                  className="w-full px-4 py-2.5 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-2 focus:ring-[#F5BD27]/20 transition-all duration-300 font-mono text-center"
                  required
                />
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 text-sm font-medium text-[#9BA0A6]">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Photos (Optional)
            </label>

            {/* Photo Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full p-6 bg-[#0A0E19] border-2 border-dashed border-[#172431] rounded-xl cursor-pointer hover:border-[#F5BD27] hover:bg-[#0A0E19]/80 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-[#172431] rounded-full group-hover:bg-[#F5BD27]/20 transition-colors">
                    <svg
                      className="w-6 h-6 text-[#9BA0A6] group-hover:text-[#F5BD27]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[#9BA0A6] group-hover:text-[#F5BD27] transition-colors">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    JPEG, PNG, GIF, WEBP (max 5 photos, 5MB each)
                  </p>
                </div>
              </label>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-[#9BA0A6] mb-3 text-center">
                  Selected Photos ({photoPreviews.length}/5)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-[#172431] group-hover:border-[#CA6162] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 p-1 bg-[#CA6162] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            <label className="flex items-center justify-center gap-2 text-sm font-medium text-[#9BA0A6]">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Well Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status }))}
                  className={`px-4 py-3 rounded-xl border transition-all duration-300 ${
                    form.status === status
                      ? `${STATUS_COLORS[status]} border-current shadow-lg scale-105`
                      : "bg-[#0A0E19] border-[#172431] text-[#9BA0A6] hover:border-[#F5BD27] hover:bg-[#0A0E19]/80"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        form.status === status ? "bg-current" : "bg-[#6B7280]"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">{status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-[#F5BD27] to-[#E6C27A] hover:from-[#E6C27A] hover:to-[#F5BD27] text-[#0A0E19] font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0A0E19] border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Create Well</span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-[#172431] hover:bg-[#1a2a3a] text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
