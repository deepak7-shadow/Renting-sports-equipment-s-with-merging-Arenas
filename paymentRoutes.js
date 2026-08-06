const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

router.post('/payment/order', protect, createOrder);
router.post('/payment/verify', protect, verifyPayment);

module.exports = router;
