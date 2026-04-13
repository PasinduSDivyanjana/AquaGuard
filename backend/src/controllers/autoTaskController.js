import AutoTask from "../models/AutoTask.js";
import {
  approveAutoTask,
  rejectAutoTask,
} from "../services/autoTaskService.js";
import { runFullAnalysis } from "../services/predictiveService.js";

export const getAutoTasks = async (req, res) => {
  try {
    const autoTasks = await AutoTask.find({})
      .populate("well", "name location status")
      .populate("suggestedOfficer", "name firstName lastName")
      .sort({ createdAt: -1 });
    res.json(autoTasks);
  } catch (error) {
    console.error("getAutoTasks error:", error);
    res.status(500).json({ message: "Server error while fetching auto tasks" });
  }
};

export const approve = async (req, res) => {
  try {
    const task = await approveAutoTask(req.params.id);
    res.json(task);
  } catch (error) {
    console.error("approve error:", error);
    res.status(500).json({ message: "Server error while approving auto task" });
  }
};

export const reject = async (req, res) => {
  try {
    const result = await rejectAutoTask(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("reject error:", error);
    res.status(500).json({ message: "Server error while rejecting auto task" });
  }
};

export const deleteAutoTask = async (req, res) => {
  try {
    const task = await AutoTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Auto task not found" });
    }
    await task.deleteOne();
    res.json({ message: "Auto task deleted successfully" });
  } catch (error) {
    console.error("deleteAutoTask error:", error);
    res.status(500).json({ message: "Server error while deleting auto task" });
  }
};

/**
 * Run AI predictive analysis on all wells.
 * Creates AutoTask entries for wells with high risk scores.
 */
export const runAnalysis = async (req, res) => {
  try {
    const result = await runFullAnalysis();
    res.json(result);
  } catch (error) {
    console.error("runAnalysis error:", error);
    res.status(500).json({ message: "Server error while running analysis" });
  }
};