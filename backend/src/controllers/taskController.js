import Task from "../models/Task.js";

// export const getTasks = async (req, res) => {
//   const tasks = await Task.find().sort({ createdAt: -1 });
//   res.json(tasks);
// };

// export const createTask = async (req, res) => {
//   const task = await Task.create(req.body);
//   res.json(task);
// };

// export const getTaskDetails = async (req, res) => {
//   const task = await Task.findById(req.params.id);
//   res.json(task);
// };

// export const updateTask = async (req, res) => {
//   const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   res.json(updated);
// };

export const getTasks = async (req, res) => {
  const tasks = await Task.find().populate("assignedTo well");
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
};

export const getTaskDetails = async (req, res) => {
  const task = await Task.findById(req.params.id).populate("assignedTo well");
  res.json(task);
};

export const updateTask = async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

// Delete a task by ID
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne(); // Remove the task from DB

    res.json({ message: "Task deleted successfully", taskId: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting task" });
  }
};
