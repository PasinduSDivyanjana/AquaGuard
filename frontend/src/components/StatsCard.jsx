export default function StatsCard({ icon, label, value, accentColor, animClass }) {
  return (
    <div
      className={`stats-card ${animClass || ""}`}
      style={{ "--card-accent": accentColor }}
    >
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">{value}</div>
    </div>
  );
}
