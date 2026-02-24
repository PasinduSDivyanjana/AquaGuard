import mongoose from 'mongoose';

const wellSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Well name is required'],
      trim: true,
    },
    location: {
      lat: { type: Number, required: [true, 'Latitude is required'] },
      lng: { type: Number, required: [true, 'Longitude is required'] },
    },
    status: {
      type: String,
      enum: ['Good', 'Needs Repair', 'Contaminated', 'Dry'],
      default: 'Good',
    },
    lastInspected: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Well = mongoose.model('Well', wellSchema);
