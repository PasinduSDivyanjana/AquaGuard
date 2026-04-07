import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import taskRoutes from "./routes/taskRoutes.js";
import autoTaskRoutes from "./routes/autoTaskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import environmentRoutes from "./routes/environmentRoutes.js";
import predictiveRoutes from "./routes/predictiveRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/tasks/auto", autoTaskRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/predictive", predictiveRoutes);

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
// Nodemon trigger
