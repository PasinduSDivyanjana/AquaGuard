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

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/report", reportRoute);

connectDB().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log("Server running");
  });
});