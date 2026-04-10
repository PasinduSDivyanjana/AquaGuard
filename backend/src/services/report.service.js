import Report from "../models/Report.js";
import severityCalculator from "../utils/severityCalculator.js";
import User from "../models/User.js";
import Well from "../models/Well.js";

export const createReportService = async (data) => {
  const { conditionType, reportedBy, wellId, imageURL } = data;

  // Fetch related data
  const user = await User.findById(reportedBy);
  const well = await Well.findById(wellId);

  // Count recent reports (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentReportCount = await Report.countDocuments({
    wellId,
    conditionType,
    createdAt: { $gte: sevenDaysAgo }
  });

  

  // Intelligent severity calculation
  const severityScore = severityCalculator({
    conditionType,
    hasImage: !!imageURL,
    recentReportCount,
    userRole: user.role,
    wellStatus: well.status
  });

  const report = new Report({
    ...data,
    severityScore
  });

  return await report.save();
};

export const getAllReportsService = async () => {
  return await Report.find()
    .populate("reportedBy", "firstName lastName email")
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