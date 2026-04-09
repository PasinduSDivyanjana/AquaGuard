import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    well: { type: mongoose.Schema.Types.ObjectId, ref: "Well" },
    riskScore: Number,
    reason: String,
    predictedDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);