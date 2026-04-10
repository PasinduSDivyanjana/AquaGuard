import Report from "../models/Report.js";
import severityCalculator from "../utils/severityCalculator.js";
import User from "../models/User.js";
import Well from "../models/Well.js";

export const createReportService = async (data) => {
  const { conditionType, reportedBy, wellId, imageURL } = data;

  // Fetch related data
  const user = await User.findById(reportedBy);
  if (!user) throw new Error("User not found");

  const well = await Well.findById(wellId);
  if (!well) throw new Error("Well not found");

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
    wellId,
    reportedBy,
    conditionType,
    description: data.description,
    imageURL,
    severityScore
  });

  return await report.save();
};

export const getAllReportsService = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.conditionType) filter.conditionType = query.conditionType;

  return await Report.find(filter)
    .populate("reportedBy", "firstName lastName email")
    .populate("wellId", "name location status")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getReportByIdService = async (id) => {
  return await Report.findById(id);
};

export const verifyReportService = async (id, status) => {
  if (!["pending", "verified", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  return await Report.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
};

export const deleteReportService = async (id) => {
  return await Report.findByIdAndDelete(id);
};