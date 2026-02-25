const severityCalculator = (conditionType) => {
  switch (conditionType) {
    case "CONTAMINATED":
      return 9;
    case "DAMAGED":
      return 7;
    case "LOW_WATER":
      return 6;
    case "DRY":
      return 10;
    default:
      return 3;
  }
};

export default severityCalculator;