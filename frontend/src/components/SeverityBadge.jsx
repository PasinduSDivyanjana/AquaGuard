export default function SeverityBadge({ score }) {
  let level = "low";
  if (score >= 9) level = "critical";
  else if (score >= 7) level = "high";
  else if (score >= 4) level = "medium";

  return (
    <span className={`severity-badge severity-badge--${level}`} title={`Severity: ${score}/10`}>
      {score}
    </span>
  );
}
