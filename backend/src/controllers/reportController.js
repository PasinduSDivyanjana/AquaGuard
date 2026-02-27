import Report from "../models/Report.js";

/**
 * CREATE REPORT
 * POST /api/reports
 */
export const createReport = async (req, res) => {
  try {
    const report = new Report(req.body);
    const savedReport = await report.save();

    res.status(201).json({
      message: "Report created successfully",
      data: savedReport
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating report",
      error: error.message
    });
  }
};

/**
 * GET ALL REPORTS
 * GET /api/reports
 */
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedBy", "name email")
      .populate("wellId", "name village");

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reports",
      error: error.message
    });
  }
};

/**
 * GET REPORT BY ID
 * GET /api/reports/:id
 */
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching report",
      error: error.message
    });
  }
};

/**
 * UPDATE REPORT
 * PUT /api/reports/:id
 */
export const updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.status(200).json({
      message: "Report updated successfully",
      data: updatedReport
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating report",
      error: error.message
    });
  }
};

/**
 * DELETE REPORT
 * DELETE /api/reports/:id
 */
export const deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.status(200).json({
      message: "Report deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting report",
      error: error.message
    });
  }
};