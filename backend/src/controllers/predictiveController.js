import Prediction from "../models/Prediction.js";

export const getOverview = async (req, res) => {
  const predictions = await Prediction.find().sort({ createdAt: -1 });
  res.json(predictions);
};