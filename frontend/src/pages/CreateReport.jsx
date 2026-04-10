// frontend/src/pages/CreateReport.jsx
import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";
import { AuthContext } from "../context/AuthContext";
import WellMap from "../components/WellMap";

export default function CreateReport() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // ← logged-in user from JWT session
  const [loading, setLoading] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMode, setImageMode] = useState("capture");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    conditionType: "",
    description: "",
    imageURL: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm({ ...form, imageURL: "" });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to submit a report");
      return;
    }

    if (!selectedWell) {
      toast.error("Please select a well on the map");
      return;
    }

    if (!form.conditionType) {
      toast.error("Please select a condition type");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        wellId: selectedWell._id,
        reportedBy: user._id,
        conditionType: form.conditionType,
      };
      if (form.description.trim()) payload.description = form.description;
      if (imageFile) payload.image = imageFile;
      else if (form.imageURL.trim()) payload.imageURL = form.imageURL;

      await createReport(payload);
      toast.success("Report created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5BD27]/10 rounded-full mb-4">
          <div className="w-2 h-2 bg-[#F5BD27] rounded-full animate-pulse" />
          <span className="text-xs font-medium text-[#F5BD27] uppercase tracking-wider">
            Report Management
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">Create Report</h1>
        <p className="text-[#9BA0A6] text-sm mt-1">
          Submit a new water well condition report
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Reporting As ── */}
        <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6">
          <p className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-4">
            Reporting As
          </p>
          {user ? (
            <div className="flex items-center gap-4 p-4 bg-[#0A0E19] rounded-xl border border-[#172431]">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold text-lg shrink-0">
                {user.firstName?.[0] ?? user.name?.[0] ?? user.email?.[0] ?? "?"}
              </div>
              <div>
                <p className="font-semibold text-white">
                  {user.firstName
                    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
                    : user.name ?? user.email}
                </p>
                <p className="text-xs text-[#9BA0A6] mt-0.5 capitalize">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#CA6162]/10 border border-[#CA6162]/30 rounded-xl">
              <p className="text-sm text-[#CA6162]">
                ⚠ You are not logged in. Please log in to submit a report.
              </p>
            </div>
          )}
        </div>

        {/* ── Select Well via Map ── */}
        <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6">
          <p className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-4">
            Select Well <span className="text-[#CA6162]">*</span>
          </p>
          <WellMap
            selectedWellId={selectedWell?._id}
            onSelectWell={setSelectedWell}
          />
        </div>

        {/* ── Condition Type ── */}
        <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6">
          <p className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-4">
            Condition Type <span className="text-[#CA6162]">*</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "DRY", label: "Dry", icon: "🏜️", active: "border-[#6B7280] bg-[#6B7280]/10 text-[#9BA0A6]" },
              { value: "CONTAMINATED", label: "Contaminated", icon: "☣️", active: "border-[#CA6162] bg-[#CA6162]/10 text-[#CA6162]" },
              { value: "DAMAGED", label: "Damaged", icon: "🔨", active: "border-[#F5BD27] bg-[#F5BD27]/10 text-[#F5BD27]" },
              { value: "LOW_WATER", label: "Low Water", icon: "💧", active: "border-[#4BDA7F] bg-[#4BDA7F]/10 text-[#4BDA7F]" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, conditionType: opt.value })}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${form.conditionType === opt.value
                    ? opt.active
                    : "border-[#172431] bg-[#0A0E19] text-[#9BA0A6] hover:border-[#F5BD27]/40"
                  }`}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="text-xs font-semibold">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Description ── */}
        <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6">
          <p className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-4">
            Description
          </p>
          <textarea
            name="description"
            rows={4}
            className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27]/20 transition-all resize-none text-sm"
            placeholder="Describe the condition of the well in detail…"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
          />
          <p className="text-xs text-[#6B7280] text-right mt-1">
            {form.description.length}/500
          </p>
        </div>

        {/* ── Evidence Image ── */}
        <div className="bg-[#101624] rounded-2xl border border-[#172431] p-6">
          <p className="text-xs font-semibold text-[#9BA0A6] uppercase tracking-wider mb-4">
            Evidence Image
          </p>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            {[
              { key: "capture", label: "📷 Upload / Capture" },
              { key: "url", label: "🔗 Paste URL" },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setImageMode(m.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${imageMode === m.key
                    ? "bg-[#F5BD27] text-[#0A0E19]"
                    : "bg-[#172431] text-[#9BA0A6] hover:bg-[#1a2a3a]"
                  }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {imageMode === "capture" ? (
            <>
              {imagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#172431]">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-56 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 px-3 py-1.5 bg-[#CA6162] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-[#172431] hover:border-[#F5BD27]/40 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="text-4xl">📷</div>
                  <p className="text-sm text-[#9BA0A6] group-hover:text-white transition-colors">
                    Click to upload or{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                      className="text-[#F5BD27] hover:underline"
                    >
                      take a photo
                    </button>
                  </p>
                  <p className="text-xs text-[#6B7280]">JPEG, PNG, WebP, GIF — max 5 MB</p>
                </div>
              )}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileSelect} className="hidden" />
            </>
          ) : (
            <input
              name="imageURL"
              type="url"
              className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-xl text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] transition-all text-sm"
              placeholder="https://example.com/image.jpg"
              value={form.imageURL}
              onChange={handleChange}
            />
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !user}
            className="flex-1 py-3 bg-gradient-to-r from-[#F5BD27] to-[#E6C27A] hover:from-[#E6C27A] hover:to-[#F5BD27] text-[#0A0E19] font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0A0E19] border-t-transparent rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              "🚀 Submit Report"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-[#172431] hover:bg-[#1a2a3a] text-white rounded-xl transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
