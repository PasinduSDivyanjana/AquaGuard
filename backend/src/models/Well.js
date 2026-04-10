import mongoose from "mongoose";

const wellSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Well name is required"],
      trim: true,
    },
    location: {
      lat: { type: Number, required: [true, "Latitude is required"] },
      lng: { type: Number, required: [true, "Longitude is required"] },
    },
    status: {
      type: String,
      enum: ["Good", "Needs Repair", "Contaminated", "Dry"],
      default: "Good",
    },
    lastInspected: {
      type: Date,
      default: null,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 5,
        message: "Maximum 5 photos allowed",
      },
    },

    // ✅ ADD THIS
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WellModel = mongoose.model("Well", wellSchema);
export default WellModel;