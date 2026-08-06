const Equipment = require('../models/Equipment');
const Arena = require('../models/Arena');

// GET /equipment?arenaId=&sport=
const getEquipment = async (req, res) => {
  try {
    const { arenaId, sport } = req.query;
    const filter = {};
    if (arenaId) filter.arenaId = arenaId;
    if (sport) filter.sport = new RegExp(sport, 'i');

    const equipment = await Equipment.find(filter);
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch equipment', error: err.message });
  }
};

// POST /equipment  (arena_owner - must own the arena)
const createEquipment = async (req, res) => {
  try {
    const { name, sport, pricePerHour, quantity, condition, arenaId } = req.body;
    if (!name || !sport || pricePerHour == null || !arenaId) {
      return res.status(400).json({ message: 'name, sport, pricePerHour, arenaId are required' });
    }

    const arena = await Arena.findById(arenaId);
    if (!arena) return res.status(404).json({ message: 'Arena not found' });
    if (arena.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add equipment to this arena' });
    }

    const equipment = await Equipment.create({
      name,
      sport,
      pricePerHour,
      quantity,
      condition,
      arenaId,
    });
    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create equipment', error: err.message });
  }
};

module.exports = { getEquipment, createEquipment };
