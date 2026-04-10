const severityCalculator = ({
  conditionType,
  hasImage,
  recentReportCount,
  userRole,
  wellStatus
}) => {
  let severity = 0;

  // 1️⃣ Base severity by condition
  switch (conditionType) {
    case "DRY":
      severity = 9;
      break;
    case "CONTAMINATED":
      severity = 8;
      break;
    case "DAMAGED":
      severity = 6;
      break;
    case "LOW_WATER":
      severity = 5;
      break;
    default:
      severity = 3;
  }

  // 2️⃣ Image evidence bonus
  if (hasImage) severity += 1;

  // 3️⃣ Repeated issue escalation
  if (recentReportCount >= 2) severity += 2;
  else if (recentReportCount === 1) severity += 1;

  // 4️⃣ Reporter role trust
  if (userRole === "Villager") severity += 1;

  // 5️⃣ Well operational status
  if (wellStatus === "Dry") severity += 2;
  if (wellStatus === "Needs Repair") severity += 1;

  // 6️⃣ Clamp severity between 1–10
  return Math.min(Math.max(severity, 1), 10);
};

export default severityCalculator;