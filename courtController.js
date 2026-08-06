const Court = require('../models/Court');
const Arena = require('../models/Arena');

// GET /courts?arenaId=
const getCourts = async (req, res) => {
  try {
    const { arenaId } = req.query;
    const filter = arenaId ? { arenaId } : {};
    const courts = await Court.find(filter);
    res.json(courts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courts', error: err.message });
  }
};

// POST /court  (arena_owner - must own the arena)
const createCourt = async (req, res) => {
  try {
    const { name, arenaId, sport, pricePerHour, availableSlots } = req.body;
    if (!name || !arenaId || !sport || pricePerHour == null) {
      return res.status(400).json({ message: 'name, arenaId, sport, pricePerHour are required' });
    }

    const arena = await Arena.findById(arenaId);
    if (!arena) return res.status(404).json({ message: 'Arena not found' });
    if (arena.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add courts to this arena' });
    }

    const court = await Court.create({ name, arenaId, sport, pricePerHour, availableSlots });
    res.status(201).json(court);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create court', error: err.message });
  }
};

const updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found' });

    const arena = await Arena.findById(court.arenaId);
    if (!arena || arena.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this court' });
    }

    ['name', 'sport', 'pricePerHour'].forEach((field) => {
      if (req.body[field] !== undefined) court[field] = req.body[field];
    });

    await court.save();
    res.json(court);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update court', error: err.message });
  }
};

// POST /court/:id/slots  (owner of the court's arena) — body: { slots: [{date, time}] }
const addSlots = async (req, res) => {
  try {
    const { slots } = req.body;
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: 'slots must be a non-empty array of { date, time }' });
    }

    const court = await Court.findById(req.params.id);
    if (!court) return res.status(404).json({ message: 'Court not found' });

    const arena = await Arena.findById(court.arenaId);
    if (!arena || arena.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to manage slots for this court' });
    }

    slots.forEach(({ date, time }) => {
      if (date && time) court.availableSlots.push({ date, time, isBooked: false });
    });

    await court.save();
    res.status(201).json(court);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add slots', error: err.message });
  }
};

module.exports = { getCourts, createCourt, updateCourt, addSlots };
