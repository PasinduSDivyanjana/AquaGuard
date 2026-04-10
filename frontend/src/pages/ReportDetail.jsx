import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { fetchReportById, updateReportStatus, deleteReport } from "../api/reportApi";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  MapPin,
  User,
  Calendar,
  Droplets,
  Biohazard,
  Wrench,
  AlertTriangle,
  Activity,
  Loader2,
  Image as ImageIcon,
  FileText,
  Hash,
} from "lucide-react";

/* ─── Condition meta ─────────────────────────────────────────── */
const CONDITION_META = {
  DRY: {
    icon: <Droplets className="w-4 h-4" />,
    label: "Dry",
    colors: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  CONTAMINATED: {
    icon: <Biohazard className="w-4 h-4" />,
    label: "Contaminated",
    colors: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  DAMAGED: {
    icon: <Wrench className="w-4 h-4" />,
    label: "Damaged",
    colors: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  LOW_WATER: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Low Water",
    colors: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
};

/* ─── Status meta ────────────────────────────────────────────── */
const STATUS_META = {
  pending: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/25",
    label: "Pending",
  },
  verified: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/25",
    label: "Verified",
  },
  rejected: {
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10 border-red-400/25",
    label: "Rejected",
  },
};

/* ─── Severity ring ──────────────────────────────────────────── */
function SeverityRing({ score }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(10, score) / 10;
  const offset = circumference * (1 - pct);

  const colorClass =
    score >= 9 ? "#ef4444"
    : score >= 7 ? "#f97316"
    : score >= 4 ? "#eab308"
    : "#22c55e";

  const label =
    score >= 9 ? "Critical"
    : score >= 7 ? "High"
    : score >= 4 ? "Medium"
    : "Low";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={radius}
            fill="none"
            stroke={colorClass}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease", filter: `drop-shadow(0 0 6px ${colorClass})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">/ 10</span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colorClass }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Info field ─────────────────────────────────────────────── */
function InfoField({ icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <span className="text-gray-600">{icon}</span>
        {label}
      </div>
      <div className="text-sm text-gray-200">{children}</div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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

  useEffect(() => { loadReport(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateReportStatus(id, newStatus);
      toast.success(`Report marked as ${newStatus}`);
      loadReport();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await deleteReport(id);
      toast.success("Report deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      setDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-aqua animate-spin" />
        <p className="text-sm text-gray-400">Loading report…</p>
      </div>
    );
  }

  if (!report) return null;

  const cond = CONDITION_META[report.conditionType] || {
    icon: null,
    label: report.conditionType,
    colors: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  const status = STATUS_META[report.status] || STATUS_META.pending;

  return (
    <div className="min-h-screen px-6 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <button
          id="back-btn"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-5 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Dashboard
        </button>
        <p className="text-xs font-semibold text-aqua uppercase tracking-widest mb-1">
          Report Detail
        </p>
        <h1 className="text-3xl font-bold text-white">
          {report.wellId?.name || "Unknown Well"}
        </h1>
      </div>

      <div className="max-w-3xl space-y-5">

        {/* ── Hero card: severity + badges ── */}
        <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-6 flex items-center gap-6">
          <SeverityRing score={report.severityScore} />
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${cond.colors}`}>
                {cond.icon}
                {cond.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
              <Hash className="w-3 h-3" />
              {report._id}
            </div>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoField icon={<User className="w-3.5 h-3.5" />} label="Reported By">
              <p className="font-medium text-gray-200">
                {report.reportedBy?.firstName} {report.reportedBy?.lastName}
              </p>
              {report.reportedBy?.email && (
                <p className="text-xs text-gray-500 mt-0.5">{report.reportedBy.email}</p>
              )}
            </InfoField>

            <InfoField icon={<MapPin className="w-3.5 h-3.5" />} label="Well Location">
              {report.wellId?.location ? (
                <span className="font-mono text-gray-300">
                  {report.wellId.location.lat?.toFixed(6)},{" "}
                  {report.wellId.location.lng?.toFixed(6)}
                </span>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </InfoField>

            <InfoField icon={<Activity className="w-3.5 h-3.5" />} label="Well Status">
              {report.wellId?.status ? (
                <span className="text-gray-300">{report.wellId.status}</span>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </InfoField>

            <InfoField icon={<Calendar className="w-3.5 h-3.5" />} label="Reported At">
              <span className="text-gray-300">{formatDate(report.createdAt)}</span>
            </InfoField>
          </div>
        </div>

        {/* ── Description ── */}
        {report.description && (
          <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{report.description}</p>
          </div>
        )}

        {/* ── Evidence image ── */}
        {report.imageURL && (
          <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence Image</span>
            </div>
            <img
              src={report.imageURL}
              alt="Report evidence"
              className="w-full max-h-72 object-cover rounded-xl border border-dark-border"
              onError={(e) => { e.target.closest("div.rounded-2xl").style.display = "none"; }}
            />
          </div>
        )}

        {/* ── Actions ── */}
        <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</p>

          {!deleteConfirm ? (
            <div className="flex flex-wrap gap-3">
              {report.status !== "verified" && (
                <button
                  id="verify-btn"
                  onClick={() => handleStatusChange("verified")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Verify
                </button>
              )}

              {report.status !== "rejected" && (
                <button
                  id="reject-btn"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              )}

              {report.status !== "pending" && (
                <button
                  id="reset-pending-btn"
                  onClick={() => handleStatusChange("pending")}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Reset to Pending
                </button>
              )}

              <button
                id="delete-btn"
                onClick={() => setDeleteConfirm(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dark-border text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 text-sm font-medium ml-auto transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          ) : (
            /* Confirm delete */
            <div className="flex items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-300">Delete this report?</p>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button
                  id="confirm-delete-btn"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Confirm
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-3 py-2 rounded-lg border border-dark-border text-gray-400 text-xs font-medium hover:text-gray-200 hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
