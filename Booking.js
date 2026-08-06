const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    arenaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Arena', required: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // e.g. '18:00-19:00'
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentId: { type: String }, // Razorpay payment/order id reference
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
