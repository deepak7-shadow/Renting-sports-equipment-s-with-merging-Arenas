const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getEquipment, createEquipment } = require('../controllers/equipmentController');

router.get('/equipment', getEquipment);
router.post('/equipment', protect, authorize('arena_owner'), createEquipment);

module.exports = router;
