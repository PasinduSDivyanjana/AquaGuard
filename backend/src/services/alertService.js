import Alert from "../models/Alert.js";

export const createAlert = async (alertData) => {
  return await Alert.create(alertData);
};