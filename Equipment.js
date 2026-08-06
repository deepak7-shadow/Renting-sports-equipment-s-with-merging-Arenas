const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair', 'worn'],
      default: 'good',
    },
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
