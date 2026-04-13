import Prediction from "../models/Prediction.js";
import AutoTask from "../models/AutoTask.js";
import Alert from "../models/Alert.js";
import WellModel from "../models/Well.js";

/**
 * Run predictive analysis on a single well.
 * Risk score is influenced by well status and adds controlled randomness
 * to simulate real-world ML model behavior.
 */
export const runPredictiveModel = async (well) => {
  // Base risk depending on well status
  const statusRisk = {
    Good: 15,
    "Needs Repair": 60,
    Contaminated: 75,
    Dry: 50,
  };

  const base = statusRisk[well.status] || 30;

  // Add randomness (±25 range) to simulate ML variance
  const variance = Math.floor(Math.random() * 50) - 25;
  const riskScore = Math.max(0, Math.min(100, base + variance));

  // Generate contextual reason based on conditions
  let reason;
  if (well.status === "Contaminated") {
    reason = `Well "${well.name}" shows contamination — immediate maintenance required`;
  } else if (well.status === "Needs Repair") {
    reason = `Well "${well.name}" needs repair — structural deterioration detected`;
  } else if (well.status === "Dry") {
    reason = `Well "${well.name}" is running dry — water table assessment needed`;
  } else if (riskScore > 50) {
    reason = `Well "${well.name}" — routine inspection overdue, elevated risk pattern`;
  } else {
    reason = `Well "${well.name}" — normal operational pattern, low risk`;
  }

  // Create prediction record
  const prediction = await Prediction.create({
    well: well._id,
    riskScore,
    reason,
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days out
  });

  // If risk is high enough, auto-create a maintenance task for admin review
  if (riskScore > 50) {
    // Prevent duplicates: don't create if a pending AutoTask already exists for this well
    const existing = await AutoTask.findOne({
      well: well._id,
      status: "pending",
    });

    if (!existing) {
      await AutoTask.create({
        well: well._id,
        riskScore,
        reason,
        predictedDate: prediction.predictedDate,
        status: "pending",
      });

      // Also create an Alert so admin gets notified
      await Alert.create({
        well: well._id,
        type: "AI Prediction",
        message: reason,
        severity: riskScore > 75 ? "critical" : riskScore > 60 ? "high" : "medium",
        status: "pending",
        read: false,
      });
    }
  }

  return { prediction, riskScore, triggered: riskScore > 50 };
};

/**
 * Scan ALL wells in the system and run predictive analysis on each.
 * Returns a summary of results.
 */
export const runFullAnalysis = async () => {
  const wells = await WellModel.find();

  if (wells.length === 0) {
    return { message: "No wells found in the system", results: [] };
  }

  const results = [];

  for (const well of wells) {
    try {
      const result = await runPredictiveModel(well);
      results.push({
        wellId: well._id,
        wellName: well.name,
        wellStatus: well.status,
        riskScore: result.riskScore,
        autoTaskTriggered: result.triggered,
      });
    } catch (err) {
      console.error(`Prediction failed for well ${well.name}:`, err.message);
      results.push({
        wellId: well._id,
        wellName: well.name,
        error: err.message,
      });
    }
  }

  const triggered = results.filter((r) => r.autoTaskTriggered).length;

  return {
    message: `Analysis complete: ${wells.length} wells scanned, ${triggered} auto-tasks generated`,
    totalWells: wells.length,
    tasksTriggered: triggered,
    results,
  };
};