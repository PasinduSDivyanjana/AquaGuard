import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import wellRoute from "./routes/wellRoute.js";
import reportRoute from "./routes/reportRoute.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import taskRoutes from "./routes/taskRoutes.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import autoTaskRoutes from "./routes/autoTaskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import environmentRoutes from "./routes/environmentRoutes.js";
import predictiveRoutes from "./routes/predictiveRoutes.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";

const PORT = process.env.PORT || 5001;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Enable CORS
app.use(cors());

app.use(express.json());

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });

// ROUTES
app.use("/api/tasks/auto", autoTaskRoutes);
app.use("/api/report", reportRoute);
app.use("/api/tasks", taskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/environment", environmentRoutes);
app.use("/api/predictive", predictiveRoutes);
app.use("/api/user", userRoute);
app.use("/api/wells", wellRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started in port", PORT);
  });
});
