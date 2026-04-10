import severityCalculator from "../utils/severityCalculator.js";
import User from "../models/User.js";
import Well from "../models/Well.js";
import Report from "../models/Report.js";
import { cloudinary } from "../config/cloudinary.js";
import {
  createReportService,
  getAllReportsService,
  verifyReportService,
  deleteReportService
} from "../services/report.service.js";

/**
 * CREATE REPORT
 */
export const createReport = async (req, res) => {
  try {
    const { wellId, conditionType } = req.body;

    if (!wellId || !conditionType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Upload image to Cloudinary if a file was provided
    let imageURL = req.body.imageURL || undefined;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "aquaguard/reports", resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageURL = result.secure_url;
    }

    const report = await createReportService({
      ...req.body,
      reportedBy: req.user?.id || req.body.reportedBy,
      imageURL
    });

    const populatedReport = await report.populate([
      { path: "reportedBy", select: "firstName lastName email" },
      { path: "wellId", select: "name location status" }
    ]);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: populatedReport
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * GET ALL REPORTS
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await getAllReportsService(req.query);

    res.status(200).json({
      success: true,
      data: reports
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
/**
 * GET REPORT BY ID
 */
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "firstName lastName email")
      .populate("wellId", "name location status");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

/**
 * UPDATE REPORT
 */
export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Merge updated data
    const updatedData = { ...report._doc, ...req.body };

    // Fetch user & well
    const user = await User.findById(updatedData.reportedBy);
    const well = await Well.findById(updatedData.wellId);

    // Count recent reports
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReportCount = await Report.countDocuments({
      wellId: updatedData.wellId,
      conditionType: updatedData.conditionType,
      createdAt: { $gte: sevenDaysAgo },
      _id: { $ne: report._id } // exclude current report
    });

    // Recalculate severity
    updatedData.severityScore = severityCalculator({
      conditionType: updatedData.conditionType,
      hasImage: !!updatedData.imageURL,
      recentReportCount,
      userRole: user.role,
      wellStatus: well.status
    });

    // Apply update
    Object.assign(report, updatedData);
    await report.save();

    const populatedReport = await report.populate([
      { path: "reportedBy", select: "firstName lastName email" },
      { path: "wellId", select: "name location status" }
    ]);

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: populatedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating report", error: error.message });
  }
};

/**
 * DELETE REPORT
 */
export const deleteReport = async (req, res) => {
  try {
    await deleteReportService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const report = await verifyReportService(req.params.id, req.body.status);

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};