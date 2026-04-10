import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchReports } from "../api/reportApi";
import StatsCard from "../components/StatsCard";
import SeverityBadge from "../components/SeverityBadge";
import StatusChip from "../components/StatusChip";

const CONDITION_ICONS = {
  DRY: "🏜️",
  CONTAMINATED: "☣️",
  DAMAGED: "🔨",
  LOW_WATER: "💧",
};

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

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="page-header animate-in">
        <h2>Dashboard</h2>
        <p>Monitor and manage water well condition reports</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <StatsCard
          icon="📋"
          label="Total Reports"
          value={totalReports}
          accentColor="#178B96"
          animClass="animate-in animate-in-1"
        />
        <StatsCard
          icon="⏳"
          label="Pending"
          value={pendingCount}
          accentColor="#F5BD27"
          animClass="animate-in animate-in-2"
        />
        <StatsCard
          icon="✅"
          label="Verified"
          value={verifiedCount}
          accentColor="#4BDA7F"
          animClass="animate-in animate-in-3"
        />
        <StatsCard
          icon="❌"
          label="Rejected"
          value={rejectedCount}
          accentColor="#CA6162"
          animClass="animate-in animate-in-4"
        />
      </div>

      {/* Filters */}
      <div className="filters-bar animate-in">
        <span className="filter-label">Filter by:</span>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          id="filter-status"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          className="filter-select"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          id="filter-condition"
        >
          <option value="">All Conditions</option>
          <option value="DRY">Dry</option>
          <option value="CONTAMINATED">Contaminated</option>
          <option value="DAMAGED">Damaged</option>
          <option value="LOW_WATER">Low Water</option>
        </select>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No reports found</h3>
          <p>Try adjusting your filters or create a new report.</p>
        </div>
      ) : (
        <div className="reports-table-container animate-in">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Well</th>
                <th>Condition</th>
                <th>Severity</th>
                <th>Reported By</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report._id}
                  onClick={() => navigate(`/report/${report._id}`)}
                >
                  <td>
                    <div className="table-well-info">
                      <span className="table-well-name">
                        {report.wellId?.name || "Unknown Well"}
                      </span>
                      {report.wellId?.location && (
                        <span className="table-well-coords">
                          {report.wellId.location.lat?.toFixed(4)},{" "}
                          {report.wellId.location.lng?.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`condition-badge condition-badge--${report.conditionType}`}
                    >
                      {CONDITION_ICONS[report.conditionType]}{" "}
                      {report.conditionType.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <SeverityBadge score={report.severityScore} />
                  </td>
                  <td>
                    <span className="table-reporter">
                      {report.reportedBy?.firstName}{" "}
                      {report.reportedBy?.lastName}
                    </span>
                  </td>
                  <td>
                    <StatusChip status={report.status} />
                  </td>
                  <td>
                    <span className="table-date">
                      {formatDate(report.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
