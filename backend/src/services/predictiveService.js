import Prediction from "../models/Prediction.js";
import AutoTask from "../models/AutoTask.js";

export const runPredictiveModel = async (well) => {
  const riskScore = Math.floor(Math.random() * 100);
  const reason =
    riskScore > 50
      ? "High water usage + low rainfall"
      : "Normal operational pattern";

  const prediction = await Prediction.create({
    well: well._id,
    riskScore,
    reason,
    predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  if (riskScore > 65) {
    await AutoTask.create({
      well: well._id,
      riskScore,
      reason,
      predictedDate: prediction.predictedDate,
    });
  }

  return prediction;
};