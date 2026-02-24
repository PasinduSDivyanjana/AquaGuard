import mongoose from "mongoose";

const autoTaskSchema = new mongoose.Schema(
  {
    well: { type: mongoose.Schema.Types.ObjectId, ref: "Well" },
    riskScore: Number,
    reason: String,
    predictedDate: Date,
    suggestedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AutoTask", autoTaskSchema);