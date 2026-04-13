import mongoose from "mongoose";

const weatherCacheSchema = new mongoose.Schema({
  well: { type: mongoose.Schema.Types.ObjectId, ref: "Well" },
  temperature: Number,
  humidity: Number,
  rainfall: Number,
  fetchedAt: Date,
});

export default mongoose.model("WeatherCache", weatherCacheSchema);