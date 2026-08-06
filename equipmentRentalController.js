const EquipmentRental = require('../models/EquipmentRental');
const Equipment = require('../models/Equipment');
const Arena = require('../models/Arena');

// POST /rental  (customer) — body: { equipmentId, quantity, rentalDuration, returnDate }
const createRental = async (req, res) => {
  try {
    const { equipmentId, quantity = 1, rentalDuration, returnDate } = req.body;
    if (!equipmentId || !rentalDuration || !returnDate) {
      return res.status(400).json({ message: 'equipmentId, rentalDuration and returnDate are required' });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    if (equipment.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough equipment available' });
    }

    const deposit = equipment.pricePerHour * quantity; // simple 1-hour-rate deposit
    const rental = await EquipmentRental.create({
      userId: req.user.id,
      equipmentId,
      quantity,
      rentalDuration,
      deposit,
      returnDate,
    });

    equipment.quantity -= quantity;
    await equipment.save();

    res.status(201).json(rental);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create rental', error: err.message });
  }
};

// GET /rental  (customer sees own; arena_owner sees rentals for their equipment; admin sees all)
const getRentals = async (req, res) => {
  try {
    let rentals;
    if (req.user.role === 'admin') {
      rentals = await EquipmentRental.find().populate('equipmentId').populate('userId', 'name email');
    } else if (req.user.role === 'arena_owner') {
      const myArenas = await Arena.find({ ownerId: req.user.id }).select('_id');
      const myEquipment = await Equipment.find({ arenaId: { $in: myArenas.map((a) => a._id) } }).select('_id');
      rentals = await EquipmentRental.find({ equipmentId: { $in: myEquipment.map((e) => e._id) } })
        .populate('equipmentId')
        .populate('userId', 'name email');
    } else {
      rentals = await EquipmentRental.find({ userId: req.user.id }).populate('equipmentId');
    }
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rentals', error: err.message });
  }
};

// PUT /rental/:id/return  (renter, arena_owner of the equipment, or admin) — marks returned, restocks quantity
const returnRental = async (req, res) => {
  try {
    const rental = await EquipmentRental.findById(req.params.id).populate('equipmentId');
    if (!rental) return res.status(404).json({ message: 'Rental not found' });
    if (rental.status === 'returned') {
      return res.status(400).json({ message: 'Rental already returned' });
    }

    const isRenter = rental.userId.toString() === req.user.id;
    let isOwner = false;
    if (req.user.role === 'arena_owner') {
      const arena = await Arena.findById(rental.equipmentId.arenaId);
      isOwner = arena && arena.ownerId.toString() === req.user.id;
    }
    if (!isRenter && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this rental' });
    }

    rental.status = 'returned';
    await rental.save();

    const equipment = await Equipment.findById(rental.equipmentId._id);
    equipment.quantity += rental.quantity;
    await equipment.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: 'Failed to return rental', error: err.message });
  }
};

module.exports = { createRental, getRentals, returnRental };
