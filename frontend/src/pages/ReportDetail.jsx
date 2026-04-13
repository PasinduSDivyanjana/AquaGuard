import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  fetchReportById,
  updateReportStatus,
  deleteReport,
} from "../api/reportApi";
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
  Clock,
  Award,
  Shield,
} from "lucide-react";

/* ─── Condition meta ─────────────────────────────────────────── */
const CONDITION_META = {
  DRY: {
    icon: <Droplets className="w-4 h-4" />,
    label: "Dry",
    colors: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    gradient: "from-amber-500/20 to-transparent",
  },
  CONTAMINATED: {
    icon: <Biohazard className="w-4 h-4" />,
    label: "Contaminated",
    colors: "bg-red-500/15 text-red-400 border-red-500/30",
    gradient: "from-red-500/20 to-transparent",
  },
  DAMAGED: {
    icon: <Wrench className="w-4 h-4" />,
    label: "Damaged",
    colors: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    gradient: "from-orange-500/20 to-transparent",
  },
  LOW_WATER: {
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Low Water",
    colors: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    gradient: "from-blue-500/20 to-transparent",
  },
};

/* ─── Status meta ────────────────────────────────────────────── */
const STATUS_META = {
  pending: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/25",
    label: "Pending Review",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  verified: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/25",
    label: "Verified",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  rejected: {
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-400/10 border-red-400/25",
    label: "Rejected",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

/* ─── Severity ring ──────────────────────────────────────────── */
function SeverityRing({ score }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(10, score) / 10;
  const offset = circumference * (1 - pct);

  const color = {
    bg:
      score >= 9
        ? "#ef4444"
        : score >= 7
        ? "#f97316"
        : score >= 4
        ? "#eab308"
        : "#22c55e",
    light:
      score >= 9
        ? "rgba(239,68,68,0.2)"
        : score >= 7
        ? "rgba(249,115,22,0.2)"
        : score >= 4
        ? "rgba(234,179,8,0.2)"
        : "rgba(34,197,94,0.2)",
  };

  const label =
    score >= 9
      ? "Critical"
      : score >= 7
      ? "High"
      : score >= 4
      ? "Medium"
      : "Low";

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative w-32 h-32">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
          style={{ backgroundColor: color.bg }}
        />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient
              id="severityGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color.bg} />
              <stop offset="100%" stopColor={color.bg} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#severityGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.4s ease",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white leading-none tabular-nums">
            {score}
          </span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
            / 10
          </span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{ backgroundColor: color.light, color: color.bg }}
      >
        {label} Severity
      </div>
    </div>
  );
}

/* ─── Info card ─────────────────────────────────────────────── */
function InfoCard({ icon, title, children, className = "" }) {
  return (
    <div
      className={`bg-gradient-to-br from-[#0A0E19] to-[#0D1220] rounded-xl border border-[#172431] p-5 hover:border-[#F5BD27]/30 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-[#F5BD27]/10">
          <div className="text-[#F5BD27]">{icon}</div>
        </div>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {children}
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
      navigate("/adminDashboard");
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
      toast.success("Report deleted successfully");
      navigate("/adminDashboard");
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#F5BD27]/20 border-t-[#F5BD27] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#F5BD27]/20 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm text-gray-400 font-medium">
          Loading report details...
        </p>
      </div>
    );
  }

  if (!report) return null;

  const cond = CONDITION_META[report.conditionType] || {
    icon: null,
    label: report.conditionType,
    colors: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    gradient: "from-gray-500/20 to-transparent",
  };
  const status = STATUS_META[report.status] || STATUS_META.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] px-6 py-8">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/adminDashboard")}
          className="group flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-[#101624] border border-[#172431] hover:border-[#F5BD27]/50 hover:bg-[#F5BD27]/5 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 text-[#9BA0A6] group-hover:text-[#F5BD27] group-hover:-translate-x-0.5 transition-all duration-200" />
          <span className="text-sm text-[#9BA0A6] group-hover:text-white font-medium">
            Back to Dashboard
          </span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5BD27]/10 rounded-full mb-4">
            <div className="w-2 h-2 bg-[#F5BD27] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#F5BD27] uppercase tracking-wider">
              Report Details
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {report.wellId?.name || "Unknown Well"}
          </h1>
          <div className="flex items-center gap-2 text-[#6B7280] text-sm">
            <Hash className="w-4 h-4" />
            <span className="font-mono">ID: {report._id}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Severity & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Severity Card */}
            <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-2xl border border-[#172431] p-6 flex flex-col items-center">
              <SeverityRing score={report.severityScore} />
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center justify-between pt-4 border-t border-[#172431]">
                  <span className="text-xs text-[#9BA0A6]">Condition</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${cond.colors}`}
                  >
                    {cond.icon}
                    {cond.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9BA0A6]">Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${status.bg} ${status.text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                    />
                    {status.icon}
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Well Info Card */}
            <InfoCard
              icon={<MapPin className="w-4 h-4" />}
              title="Well Information"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Coordinates</p>
                  {report.wellId?.location ? (
                    <p className="text-sm text-white font-mono">
                      {report.wellId.location.lat?.toFixed(6)}°,{" "}
                      {report.wellId.location.lng?.toFixed(6)}°
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Current Status</p>
                  {report.wellId?.status ? (
                    <span className="inline-flex px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {report.wellId.status}
                    </span>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reporter Info */}
            <InfoCard icon={<User className="w-4 h-4" />} title="Reported By">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] flex items-center justify-center text-[#0A0E19] font-bold text-lg">
                  {report.reportedBy?.firstName?.charAt(0) ||
                    report.reportedBy?.email?.charAt(0) ||
                    "?"}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                  </p>
                  {report.reportedBy?.email && (
                    <p className="text-xs text-[#6B7280]">
                      {report.reportedBy.email}
                    </p>
                  )}
                </div>
              </div>
            </InfoCard>

            {/* Date & Time */}
            <InfoCard
              icon={<Calendar className="w-4 h-4" />}
              title="Report Information"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-[#172431]">
                  <span className="text-xs text-[#6B7280]">Reported At</span>
                  <span className="text-sm text-white">
                    {formatDate(report.createdAt)}
                  </span>
                </div>
                {report.updatedAt !== report.createdAt && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-[#6B7280]">Last Updated</span>
                    <span className="text-sm text-white">
                      {formatDate(report.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Description */}
            {report.description && (
              <InfoCard
                icon={<FileText className="w-4 h-4" />}
                title="Description"
              >
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {report.description}
                </p>
              </InfoCard>
            )}

            {/* Evidence Image */}
            {report.imageURL && (
              <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-2xl border border-[#172431] overflow-hidden hover:border-[#F5BD27]/30 transition-all duration-300">
                <div className="p-5 border-b border-[#172431]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F5BD27]/10">
                      <ImageIcon className="w-4 h-4 text-[#F5BD27]" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Evidence Image
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <img
                    src={report.imageURL}
                    alt="Report evidence"
                    className="w-full max-h-96 object-contain rounded-xl border border-[#172431] hover:scale-[1.02] transition-transform duration-300"
                    onError={(e) => {
                      e.target.closest(".rounded-2xl").style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-gradient-to-br from-[#101624] to-[#0A0E19] rounded-2xl border border-[#172431] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#F5BD27]/10">
                  <Shield className="w-4 h-4 text-[#F5BD27]" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Moderation Actions
                </span>
              </div>

              {!deleteConfirm ? (
                <div className="flex flex-wrap gap-3">
                  {report.status !== "verified" && (
                    <button
                      onClick={() => handleStatusChange("verified")}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      Verify Report
                    </button>
                  )}

                  {report.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange("rejected")}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      Reject Report
                    </button>
                  )}

                  {report.status !== "pending" && (
                    <button
                      onClick={() => handleStatusChange("pending")}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      Reset to Pending
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirm(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#172431] text-[#9BA0A6] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 text-sm font-medium ml-auto transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Delete Report
                  </button>
                </div>
              ) : (
                /* Confirm delete */
                <div className="flex items-center gap-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 animate-in slide-in-from-top duration-200">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-300">
                      Delete this report?
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      This action cannot be undone. All data will be permanently
                      removed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-[#172431] bg-[#0A0E19] text-[#9BA0A6] text-sm font-medium hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
