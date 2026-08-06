const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Arena = require('../models/Arena');

// POST /booking  (customer)
const createBooking = async (req, res) => {
  try {
    const { arenaId, courtId, date, time } = req.body;
    if (!arenaId || !courtId || !date || !time) {
      return res.status(400).json({ message: 'arenaId, courtId, date, time are required' });
    }

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: 'Court not found' });

    const slot = court.availableSlots.find((s) => s.date === date && s.time === time);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.isBooked) return res.status(409).json({ message: 'Slot already booked' });

    // Atomically claim the slot to prevent double-booking race conditions
    const claimed = await Court.findOneAndUpdate(
      { _id: courtId, 'availableSlots._id': slot._id, 'availableSlots.isBooked': false },
      { $set: { 'availableSlots.$.isBooked': true } },
      { new: true }
    );
    if (!claimed) return res.status(409).json({ message: 'Slot was just booked by someone else' });

    const booking = await Booking.create({
      userId: req.user.id,
      arenaId,
      courtId,
      date,
      time,
      amount: court.pricePerHour,
      status: 'pending', // moves to 'confirmed' after payment
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
};

// GET /booking  (customer sees own; arena_owner sees bookings for their arenas; admin sees all)
const getBookings = async (req, res) => {
  try {
    let filter = { userId: req.user.id };
    if (req.user.role === 'admin') {
      filter = {};
    } else if (req.user.role === 'arena_owner') {
      const myArenas = await Arena.find({ ownerId: req.user.id }).select('_id');
      filter = { arenaId: { $in: myArenas.map((a) => a._id) } };
    }
    const bookings = await Booking.find(filter)
      .populate('arenaId', 'name location')
      .populate('courtId', 'name sport')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

module.exports = { createBooking, getBookings };
