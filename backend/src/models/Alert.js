import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    well: { type: mongoose.Schema.Types.ObjectId, ref: "Well" },
    type: String,
    message: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);