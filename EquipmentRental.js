const mongoose = require('mongoose');

const equipmentRentalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    quantity: { type: Number, required: true, default: 1 },
    rentalDuration: { type: Number, required: true }, // hours
    deposit: { type: Number, default: 0 },
    returnDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquipmentRental', equipmentRentalSchema);
