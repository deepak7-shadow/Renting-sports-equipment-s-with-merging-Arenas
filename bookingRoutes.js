const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createBooking, getBookings } = require('../controllers/bookingController');

router.post('/booking', protect, createBooking);
router.get('/booking', protect, getBookings);

module.exports = router;
