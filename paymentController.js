const crypto = require('crypto');
const Booking = require('../models/Booking');

// Lazily require razorpay so the server still boots if the package/keys
// aren't set up yet during early development.
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay'); // npm install razorpay
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// POST /payment/order  - create a Razorpay order for a booking
const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }

    const order = await getRazorpay().orders.create({
      amount: Math.round(booking.amount * 100), // paise
      currency: 'INR',
      receipt: `booking_${booking._id}`,
    });

    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
};

// POST /payment/verify - verify signature and confirm booking
const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed', paymentId: razorpay_payment_id },
      { new: true }
    );

    res.json({ message: 'Payment verified', booking });
  } catch (err) {
    res.status(500).json({ message: 'Payment verification failed', error: err.message });
  }
};

module.exports = { createOrder, verifyPayment };
