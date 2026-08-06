const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'arena_owner', 'admin'],
      default: 'customer',
    },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false }, // used for arena_owner verification by admin
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
