import Alert from "../models/Alert.js";

export const getAllAlerts = async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json(alerts);
};

export const getAlertDetails = async (req, res) => {
  const alert = await Alert.findById(req.params.id);
  res.json(alert);
};

export const markRead = async (req, res) => {
  await Alert.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: "Alert marked as read" });
};