import mongoose from "mongoose";

const wellSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  village: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number
  },
  status: {
    type: String,
    enum: ["functional", "needs repair", "out of service"],
    default: "functional"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Well = mongoose.model("Well", wellSchema);
export default Well;