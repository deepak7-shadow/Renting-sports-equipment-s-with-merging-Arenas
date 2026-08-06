const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRental, getRentals, returnRental } = require('../controllers/equipmentRentalController');

router.post('/rental', protect, createRental);
router.get('/rental', protect, getRentals);
router.put('/rental/:id/return', protect, returnRental);

module.exports = router;
