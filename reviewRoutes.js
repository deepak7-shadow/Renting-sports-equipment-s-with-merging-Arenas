const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getArenaReviews, createReview, deleteReview } = require('../controllers/reviewController');

router.get('/arenas/:arenaId/reviews', getArenaReviews);
router.post('/arenas/:arenaId/reviews', protect, authorize('customer'), createReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
