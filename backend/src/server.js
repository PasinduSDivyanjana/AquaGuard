import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors({ origin: "http://localhost:5173" })); //This middleware will allow cross-origin requests
app.use(express.json()); //This middleware will parse the JSON body

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started in port", PORT);
  });
});