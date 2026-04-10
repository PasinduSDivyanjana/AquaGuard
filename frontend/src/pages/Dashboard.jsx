import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchReports } from "../api/reportApi";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Droplets,
  Biohazard,
  Wrench,
  ArrowUpDown,
  ChevronRight,
  Loader2,
  Inbox,
} from "lucide-react";

/* ─── Condition meta ─────────────────────────────────────────── */
const CONDITION_META = {
  DRY: {
    icon: <Droplets className="w-3.5 h-3.5" />,
    label: "Dry",
    colors: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  CONTAMINATED: {
    icon: <Biohazard className="w-3.5 h-3.5" />,
    label: "Contaminated",
    colors: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  DAMAGED: {
    icon: <Wrench className="w-3.5 h-3.5" />,
    label: "Damaged",
    colors: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  LOW_WATER: {
    icon: <Droplets className="w-3.5 h-3.5" />,
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

/* ─── Severity bar ───────────────────────────────────────────── */
function SeverityBar({ score }) {
  const pct = Math.min(100, (score / 10) * 100);
  const color =
    score >= 9
      ? "from-red-500 to-red-400"
      : score >= 7
      ? "from-orange-500 to-amber-400"
      : score >= 4
      ? "from-yellow-500 to-yellow-400"
      : "from-emerald-500 to-emerald-400";

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-300 tabular-nums w-5">
        {score}
      </span>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, gradient, delay }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md p-5 flex items-center gap-4 group hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 shadow-xl"
      style={{ animationDelay: delay }}
    >
      {/* glow blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl bg-gradient-to-br ${gradient} group-hover:opacity-30 transition-opacity duration-500`}
      />
      <div
        className={`relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}
      >
        {icon}
      </div>
      <div className="relative">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold text-white tabular-nums leading-tight mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const navigate = useNavigate();

  const loadReports = async () => {
    setLoading(true);
    try {
      const query = {};
      if (filterStatus) query.status = filterStatus;
      if (filterCondition) query.conditionType = filterCondition;
      const res = await fetchReports(query);
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterCondition]);

  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const verifiedCount = reports.filter((r) => r.status === "verified").length;
  const rejectedCount = reports.filter((r) => r.status === "rejected").length;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen px-6 py-8 space-y-8">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-aqua uppercase tracking-widest mb-1">
            Overview
          </p>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitor and manage water well condition reports
          </p>
        </div>
        <button
          id="new-report-btn"
          onClick={() => navigate("/create")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aqua/10 hover:bg-aqua/20 border border-aqua/30 text-aqua text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(0,247,255,0.08)] hover:shadow-[0_0_20px_rgba(0,247,255,0.2)]"
        >
          <ClipboardList className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-white" />}
          label="Total Reports"
          value={totalReports}
          gradient="from-cyan-500 to-teal-500"
          delay="0ms"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-white" />}
          label="Pending"
          value={pendingCount}
          gradient="from-amber-500 to-orange-500"
          delay="60ms"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-white" />}
          label="Verified"
          value={verifiedCount}
          gradient="from-emerald-500 to-green-500"
          delay="120ms"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-white" />}
          label="Rejected"
          value={rejectedCount}
          gradient="from-red-500 to-rose-500"
          delay="180ms"
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter:</span>
        </div>

        {/* Status filter */}
        <select
          id="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-dark-card border border-dark-border text-sm text-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/20 cursor-pointer transition-all duration-200 hover:border-white/20"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Condition filter */}
        <select
          id="filter-condition"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="bg-dark-card border border-dark-border text-sm text-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-aqua/50 focus:ring-1 focus:ring-aqua/20 cursor-pointer transition-all duration-200 hover:border-white/20"
        >
          <option value="">All Conditions</option>
          <option value="DRY">Dry</option>
          <option value="CONTAMINATED">Contaminated</option>
          <option value="DAMAGED">Damaged</option>
          <option value="LOW_WATER">Low Water</option>
        </select>

        {/* Active filters pills */}
        {(filterStatus || filterCondition) && (
          <button
            onClick={() => {
              setFilterStatus("");
              setFilterCondition("");
            }}
            className="text-xs text-gray-400 hover:text-white border border-dark-border hover:border-white/20 rounded-xl px-3 py-2.5 transition-all duration-200"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-gray-500 font-medium">
          {loading ? "Loading…" : `${reports.length} result${reports.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* ── Table / States ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-8 h-8 text-aqua animate-spin" />
          <p className="text-sm text-gray-400">Loading reports…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-dark-card/60 border border-dark-border flex items-center justify-center">
            <Inbox className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-white font-semibold">No reports found</h3>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or{" "}
            <button
              onClick={() => navigate("/create")}
              className="text-aqua hover:underline"
            >
              create a new report
            </button>
            .
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dark-border bg-dark-card/60 backdrop-blur-md overflow-hidden shadow-2xl">
          <table className="w-full text-sm">
            {/* Table head */}
            <thead>
              <tr className="border-b border-dark-border">
                {["Well", "Condition", "Severity", "Reported By", "Status", "Date", ""].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>

            {/* Table body */}
            <tbody className="divide-y divide-dark-border/60">
              {reports.map((report, i) => {
                const cond = CONDITION_META[report.conditionType] || {
                  icon: null,
                  label: report.conditionType,
                  colors: "bg-gray-500/15 text-gray-400 border-gray-500/30",
                };
                const status = STATUS_META[report.status] || STATUS_META.pending;

                return (
                  <tr
                    key={report._id}
                    id={`report-row-${report._id}`}
                    onClick={() => navigate(`/report/${report._id}`)}
                    className="group cursor-pointer hover:bg-white/[0.02] transition-colors duration-150"
                    style={{
                      animation: `fadeSlideIn 0.3s ease both`,
                      animationDelay: `${i * 40}ms`,
                    }}
                  >
                    {/* Well */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-200 group-hover:text-white transition-colors">
                        {report.wellId?.name || "Unknown Well"}
                      </p>
                      {report.wellId?.location && (
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          {report.wellId.location.lat?.toFixed(4)},{" "}
                          {report.wellId.location.lng?.toFixed(4)}
                        </p>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cond.colors}`}
                      >
                        {cond.icon}
                        {cond.label}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-5 py-4">
                      <SeverityBar score={report.severityScore} />
                    </td>

                    {/* Reporter */}
                    <td className="px-5 py-4">
                      <p className="text-gray-300">
                        {report.reportedBy?.firstName} {report.reportedBy?.lastName}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${status.bg} ${status.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">
                      <p className="text-gray-400 whitespace-nowrap">
                        {formatDate(report.createdAt)}
                      </p>
                    </td>

                    {/* Arrow */}
                    <td className="px-4 py-4">
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-aqua group-hover:translate-x-0.5 transition-all duration-200" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
