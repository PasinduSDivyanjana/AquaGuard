import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { createReport } from "../api/reportApi";

export default function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      if (form.imageURL.trim()) payload.imageURL = form.imageURL;

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

          <div className="form-group">
            <label className="form-label" htmlFor="imageURL">
              Image URL
            </label>
            <input
              id="imageURL"
              name="imageURL"
              type="url"
              className="form-input"
              placeholder="https://example.com/image.jpg"
              value={form.imageURL}
              onChange={handleChange}
            />
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
