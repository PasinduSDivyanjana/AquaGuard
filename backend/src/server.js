import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import reportRoute from "./routes/reportRoute.js";

// 🔑 Register models
import "./models/User.js";
import "./models/Well.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/report", reportRoute);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

connectDB().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log("Server running");
  });
});