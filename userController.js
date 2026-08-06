const User = require('../models/User');
const Arena = require('../models/Arena');
const Booking = require('../models/Booking');

// GET /users  (admin)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// PUT /users/:id/verify  (admin) — verifies an arena owner account
const verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify user', error: err.message });
  }
};

// DELETE /users/:id  (admin) — remove a user (e.g. fake/abusive account)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove user', error: err.message });
  }
};

// GET /admin/reports  (admin) — high-level platform counts
const getReports = async (req, res) => {
  try {
    const [totalUsers, totalOwners, pendingOwners, totalArenas, approvedArenas, pendingArenas, totalBookings, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'arena_owner' }),
        User.countDocuments({ role: 'arena_owner', isVerified: false }),
        Arena.countDocuments(),
        Arena.countDocuments({ status: 'approved' }),
        Arena.countDocuments({ status: 'pending' }),
        Booking.countDocuments(),
        Booking.aggregate([
          { $match: { status: { $in: ['confirmed', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    res.json({
      totalUsers,
      totalOwners,
      pendingOwners,
      totalArenas,
      approvedArenas,
      pendingArenas,
      totalBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build report', error: err.message });
  }
};

module.exports = { getUsers, verifyUser, deleteUser, getReports };
