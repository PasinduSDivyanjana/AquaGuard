import Report from "../models/Report.js";
import severityCalculator from "../utils/severityCalculator.js";

export const createReportService = async (data) => {
  const severityScore = severityCalculator(data.conditionType);

  const report = new Report({
    ...data,
    severityScore
  });

  return await report.save();
};

export const getAllReportsService = async () => {
  return await Report.find()
    .populate("reportedBy", "name email")
    .populate("wellId", "name village");
};

export const getReportByIdService = async (id) => {
  return await Report.findById(id);
};

export const verifyReportService = async (id, status) => {
  return await Report.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

export const deleteReportService = async (id) => {
  return await Report.findByIdAndDelete(id);
};