const mongoose = require('mongoose');

const arenaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    sportsAvailable: [{ type: String, required: true }],
    description: { type: String },
    images: [{ type: String }], // uploaded file paths / URLs
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // admin verifies before it becomes visible/bookable
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Arena', arenaSchema);
