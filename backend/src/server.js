import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import autoTaskRoutes from "./routes/autoTaskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import environmentRoutes from "./routes/environmentRoutes.js";
import predictiveRoutes from "./routes/predictiveRoutes.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

// ROUTES
app.use("/api/tasks/auto", autoTaskRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/predictive", predictiveRoutes);
app.use("/api/user", userRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started in port", PORT);
  });
});

