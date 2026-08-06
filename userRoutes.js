const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, verifyUser, deleteUser, getReports } = require('../controllers/userController');

router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/verify', protect, authorize('admin'), verifyUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/admin/reports', protect, authorize('admin'), getReports);

module.exports = router;
