const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // e.g. '18:00-19:00'
    isBooked: { type: Boolean, default: false },
  },
  { _id: true }
);

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true },
    sport: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    availableSlots: [slotSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);
