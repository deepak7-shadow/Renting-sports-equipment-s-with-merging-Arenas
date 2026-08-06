const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getArenas,
  getArenaById,
  getMyArenas,
  getAllArenasAdmin,
  createArena,
  updateArena,
  deleteArena,
} = require('../controllers/arenaController');

router.get('/arenas', getArenas);
router.get('/arenas/mine', protect, authorize('arena_owner'), getMyArenas);
router.get('/arenas/all', protect, authorize('admin'), getAllArenasAdmin);
router.get('/arenas/:id', getArenaById);
router.post('/arena', protect, authorize('arena_owner'), createArena);
router.put('/arena/:id', protect, authorize('arena_owner', 'admin'), updateArena);
router.delete('/arena/:id', protect, authorize('arena_owner', 'admin'), deleteArena);

module.exports = router;
