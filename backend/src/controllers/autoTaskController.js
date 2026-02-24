import AutoTask from "../models/AutoTask.js";
import {
  approveAutoTask,
  rejectAutoTask,
} from "../services/autoTaskService.js";

export const getAutoTasks = async (req, res) => {
  const autoTasks = await AutoTask.find({ status: "pending" });
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