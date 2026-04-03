import AutoTask from "../models/AutoTask.js";
import {
  approveAutoTask,
  rejectAutoTask,
} from "../services/autoTaskService.js";

export const getAutoTasks = async (req, res) => {
  const autoTasks = await AutoTask.find({}).sort({ createdAt: -1 });
  res.json(autoTasks);
};

export const approve = async (req, res) => {
  const task = await approveAutoTask(req.params.id);
  res.json(task);
};

export const reject = async (req, res) => {
  const result = await rejectAutoTask(req.params.id);
  res.json(result);
};

export const deleteAutoTask = async (req, res) => {
  await AutoTask.findByIdAndDelete(req.params.id);
  res.json({ message: "Auto task deleted successfully" });
};