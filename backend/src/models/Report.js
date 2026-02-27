import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  wellId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Well",
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  conditionType: {
    type: String,
    required: true,
    enum: ["DRY", "CONTAMINATED", "DAMAGED", "LOW_WATER"]
  },
  description: String,
  imageURL: String,
  severityScore: Number,
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "verified", "rejected"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Report", reportSchema);