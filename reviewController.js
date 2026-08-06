const Review = require('../models/Review');
const Arena = require('../models/Arena');

// recompute and persist an arena's average rating
const syncArenaRating = async (arenaId) => {
  const stats = await Review.aggregate([
    { $match: { arena: arenaId } },
    { $group: { _id: '$arena', avg: { $avg: '$rating' } } },
  ]);
  const avg = stats.length ? Math.round(stats[0].avg * 10) / 10 : 0;
  await Arena.findByIdAndUpdate(arenaId, { rating: avg });
};

// GET /arenas/:arenaId/reviews  (public)
const getArenaReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ arena: req.params.arenaId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

// POST /arenas/:arenaId/reviews  (customer, must be logged in)
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) return res.status(400).json({ message: 'rating is required' });

    const arena = await Arena.findById(req.params.arenaId);
    if (!arena) return res.status(404).json({ message: 'Arena not found' });

    const existing = await Review.findOne({ user: req.user.id, arena: req.params.arenaId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this arena' });

    const review = await Review.create({
      user: req.user.id,
      arena: req.params.arenaId,
      rating,
      comment,
    });

    await syncArenaRating(req.params.arenaId);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};

// DELETE /reviews/:id  (review author, or admin)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const isAuthor = review.user.toString() === req.user.id;
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const arenaId = review.arena;
    await review.deleteOne();
    await syncArenaRating(arenaId);

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};

module.exports = { getArenaReviews, createReview, deleteReview };
