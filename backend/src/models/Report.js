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
  description: {
    type: String,
    maxlength: 500
  },
  imageURL: {
    type: String,
    trim: true
  },
  severityScore: {
    type: Number,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "verified", "rejected"]
  }
}, { timestamps: true });

reportSchema.index({ wellId: 1, createdAt: -1 });