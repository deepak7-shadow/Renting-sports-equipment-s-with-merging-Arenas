const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCourts, createCourt, updateCourt, addSlots } = require('../controllers/courtController');

router.get('/courts', getCourts);
router.post('/court', protect, authorize('arena_owner'), createCourt);
router.put('/court/:id', protect, authorize('arena_owner'), updateCourt);
router.post('/court/:id/slots', protect, authorize('arena_owner'), addSlots);

module.exports = router;
