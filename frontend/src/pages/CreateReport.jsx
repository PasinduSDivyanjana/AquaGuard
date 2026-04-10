import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";

export default function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageMode, setImageMode] = useState("capture"); // "capture" or "url"
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    wellId: "",
    reportedBy: "",
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

    if (!form.wellId || !form.reportedBy || !form.conditionType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        wellId: form.wellId,
        reportedBy: form.reportedBy,
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

      <div className="form-card animate-in animate-in-1">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="wellId">
              Well ID *
            </label>
            <input
              id="wellId"
              name="wellId"
              type="text"
              className="form-input"
              placeholder="Enter MongoDB Well ObjectId"
              value={form.wellId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reportedBy">
              Reported By (User ID) *
            </label>
            <input
              id="reportedBy"
              name="reportedBy"
              type="text"
              className="form-input"
              placeholder="Enter MongoDB User ObjectId"
              value={form.reportedBy}
              onChange={handleChange}
              required
            />
          </div>

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

            {/* Mode Toggle */}
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
                {/* Image Preview */}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={removeImage}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Capture / Upload Buttons */}
                {!imagePreview && (
                  <div className="image-capture-area">
                    <div className="capture-icon">📷</div>
                    <p>Take a photo or choose from gallery</p>

                    <div className="capture-buttons">
                      {/* Camera button — opens camera on mobile */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        📸 Take Photo
                      </button>

                      {/* File picker */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        🖼️ Choose File
                      </button>
                    </div>

                    {/* Hidden inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* URL Input */
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

            <p className="image-hint">
              Supported: JPEG, PNG, WebP, GIF — Max 5MB
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "🚀 Submit Report"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
