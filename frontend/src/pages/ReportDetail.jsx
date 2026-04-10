import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { fetchReportById, updateReportStatus, deleteReport } from "../api/reportApi";
import StatusChip from "../components/StatusChip";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadReport = async () => {
    try {
      const res = await fetchReportById(id);
      setReport(res.data);
    } catch (err) {
      toast.error("Report not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateReportStatus(id, newStatus);
      toast.success(`Report ${newStatus}`);
      loadReport();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setActionLoading(true);
    try {
      await deleteReport(id);
      toast.success("Report deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityColor = (score) => {
    if (score >= 9) return "#E54545";
    if (score >= 7) return "#CA6162";
    if (score >= 4) return "#F5BD27";
    return "#4BDA7F";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!report) return null;

  const sevColor = getSeverityColor(report.severityScore);

  return (
    <div className="detail-page">
      <a className="detail-back-link" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        ← Back to Dashboard
      </a>

      <div className="detail-card animate-in">
        {/* Top Section */}
        <div className="detail-card-top">
          <div className="detail-card-top-left">
            <h3>{report.wellId?.name || "Unknown Well"}</h3>
            <p>
              Report ID: {report._id}
            </p>
          </div>
          <div
            className="detail-severity-ring"
            style={{ borderColor: sevColor, color: sevColor }}
          >
            <span className="score">{report.severityScore}</span>
            <span className="score-label">Severity</span>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="detail-grid">
          <div className="detail-field">
            <div className="detail-field-label">Condition Type</div>
            <div className="detail-field-value">
              <span className={`condition-badge condition-badge--${report.conditionType}`}>
                {report.conditionType.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Status</div>
            <div className="detail-field-value">
              <StatusChip status={report.status} />
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Reported By</div>
            <div className="detail-field-value">
              {report.reportedBy?.firstName} {report.reportedBy?.lastName}
              <br />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {report.reportedBy?.email}
              </span>
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Well Location</div>
            <div className="detail-field-value">
              {report.wellId?.location ? (
                <>
                  📍 {report.wellId.location.lat?.toFixed(6)},{" "}
                  {report.wellId.location.lng?.toFixed(6)}
                </>
              ) : (
                "N/A"
              )}
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Well Status</div>
            <div className="detail-field-value">
              {report.wellId?.status || "N/A"}
            </div>
          </div>

          <div className="detail-field">
            <div className="detail-field-label">Created At</div>
            <div className="detail-field-value">
              {formatDate(report.createdAt)}
            </div>
          </div>
        </div>

        {/* Description */}
        {report.description && (
          <div className="detail-description">
            <div className="detail-field-label">Description</div>
            <div className="detail-field-value">{report.description}</div>
          </div>
        )}

        {/* Image */}
        {report.imageURL && (
          <div className="detail-image-preview">
            <div className="detail-field-label">Evidence Image</div>
            <div style={{ marginTop: "10px" }}>
              <img
                src={report.imageURL}
                alt="Report evidence"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          {report.status !== "verified" && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleStatusChange("verified")}
              disabled={actionLoading}
            >
              ✅ Verify
            </button>
          )}
          {report.status !== "rejected" && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleStatusChange("rejected")}
              disabled={actionLoading}
              style={{ borderColor: "var(--coral)", color: "var(--coral)" }}
            >
              🚫 Reject
            </button>
          )}
          {report.status !== "pending" && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleStatusChange("pending")}
              disabled={actionLoading}
            >
              ↩️ Reset to Pending
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={actionLoading}
            style={{ marginLeft: "auto" }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
