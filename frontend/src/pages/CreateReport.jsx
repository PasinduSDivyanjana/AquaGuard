import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";
import { useUser } from "../context/UserContext";
import WellMap from "../components/WellMap";

export default function CreateReport() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
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

    if (!currentUser) {
      toast.error("Please select a user from the sidebar first");
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
        reportedBy: currentUser._id,
        conditionType: form.conditionType,
      };
      if (form.description.trim()) payload.description = form.description;
      if (imageFile) payload.image = imageFile;
      else if (form.imageURL.trim()) payload.imageURL = form.imageURL;

      await createReport(payload);
      toast.success("Report created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Create Report</h2>
        <p>Submit a new water well condition report</p>
      </div>

      {!currentUser && (
        <div className="alert-banner animate-in">
          ⚠️ Please select a user from the sidebar to continue
        </div>
      )}

      <div className="form-card animate-in animate-in-1" style={{ maxWidth: "720px" }}>
        <form onSubmit={handleSubmit}>
          {/* Reporting as */}
          <div className="form-group">
            <label className="form-label">Reporting As</label>
            {currentUser ? (
              <div className="reporting-as-badge">
                <span className="reporting-as-avatar">
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </span>
                <div>
                  <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                  <span className="reporting-as-role">{currentUser.role}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No user selected — use the sidebar dropdown
              </p>
            )}
          </div>

          {/* Well Selection via Map */}
          <div className="form-group">
            <label className="form-label">Select Well *</label>
            <WellMap
              selectedWellId={selectedWell?._id}
              onSelectWell={setSelectedWell}
            />
          </div>

          {/* Condition Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="conditionType">
              Condition Type *
            </label>
            <select
              id="conditionType"
              name="conditionType"
              className="form-select"
              value={form.conditionType}
              onChange={handleChange}
              required
            >
              <option value="">Select condition...</option>
              <option value="DRY">🏜️ Dry</option>
              <option value="CONTAMINATED">☣️ Contaminated</option>
              <option value="DAMAGED">🔨 Damaged</option>
              <option value="LOW_WATER">💧 Low Water</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Describe the condition of the well..."
              value={form.description}
              onChange={handleChange}
              maxLength={500}
            />
          </div>

          {/* Image Section */}
          <div className="form-group">
            <label className="form-label">Evidence Image</label>
            <div className="image-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${imageMode === "capture" ? "mode-btn--active" : ""}`}
                onClick={() => setImageMode("capture")}
              >
                📷 Capture / Upload
              </button>
              <button
                type="button"
                className={`mode-btn ${imageMode === "url" ? "mode-btn--active" : ""}`}
                onClick={() => setImageMode("url")}
              >
                🔗 Paste URL
              </button>
            </div>

            {imageMode === "capture" ? (
              <>
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button type="button" className="image-remove-btn" onClick={removeImage} title="Remove">
                      ✕
                    </button>
                  </div>
                )}
                {!imagePreview && (
                  <div className="image-capture-area">
                    <div className="capture-icon">📷</div>
                    <p>Take a photo or choose from gallery</p>
                    <div className="capture-buttons">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => cameraInputRef.current?.click()}>
                        📸 Take Photo
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                        🖼️ Choose File
                      </button>
                    </div>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: "none" }} />
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileSelect} style={{ display: "none" }} />
                  </div>
                )}
              </>
            ) : (
              <input
                id="imageURL"
                name="imageURL"
                type="url"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={form.imageURL}
                onChange={handleChange}
              />
            )}
            <p className="image-hint">Supported: JPEG, PNG, WebP, GIF — Max 5MB</p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !currentUser}>
              {loading ? "Submitting..." : "🚀 Submit Report"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
