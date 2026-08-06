const Arena = require('../models/Arena');

// GET /arenas  (public - supports ?city=&sport=)
const getArenas = async (req, res) => {
  try {
    const { city, sport } = req.query;
    const filter = { status: 'approved' };
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (sport) filter.sportsAvailable = new RegExp(sport, 'i');

    const arenas = await Arena.find(filter).populate('ownerId', 'name email');
    res.json(arenas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch arenas', error: err.message });
  }
};

// GET /arenas/:id  (public)
const getArenaById = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id).populate('ownerId', 'name email');
    if (!arena) return res.status(404).json({ message: 'Arena not found' });
    res.json(arena);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch arena', error: err.message });
  }
};

// GET /arenas/mine  (arena_owner - own arenas, any status)
const getMyArenas = async (req, res) => {
  try {
    const arenas = await Arena.find({ ownerId: req.user.id });
    res.json(arenas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your arenas', error: err.message });
  }
};

// GET /arenas/all  (admin - every arena regardless of status)
const getAllArenasAdmin = async (req, res) => {
  try {
    const arenas = await Arena.find().populate('ownerId', 'name email isVerified');
    res.json(arenas);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch arenas', error: err.message });
  }
};

// POST /arena  (arena_owner only)
const createArena = async (req, res) => {
  try {
    const { name, location, sportsAvailable, description, images } = req.body;
    if (!name || !location || !sportsAvailable) {
      return res.status(400).json({ message: 'name, location and sportsAvailable are required' });
    }

    const arena = await Arena.create({
      name,
      location,
      sportsAvailable,
      description,
      images,
      ownerId: req.user.id,
      status: 'pending', // needs admin verification
    });

    res.status(201).json(arena);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create arena', error: err.message });
  }
};

// PUT /arena/:id  (owner of that arena, or admin)
const updateArena = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);
    if (!arena) return res.status(404).json({ message: 'Arena not found' });

    const isOwner = arena.ownerId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this arena' });
    }

    const updatable = ['name', 'location', 'sportsAvailable', 'description', 'images'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) arena[field] = req.body[field];
    });

    // only admin can change status (verification)
    if (req.user.role === 'admin' && req.body.status) {
      arena.status = req.body.status;
    }

    await arena.save();
    res.json(arena);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update arena', error: err.message });
  }
};

// DELETE /arena/:id  (owner of that arena, or admin)
const deleteArena = async (req, res) => {
  try {
    const arena = await Arena.findById(req.params.id);
    if (!arena) return res.status(404).json({ message: 'Arena not found' });

    const isOwner = arena.ownerId.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this arena' });
    }

    await arena.deleteOne();
    res.json({ message: 'Arena deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete arena', error: err.message });
  }
};

module.exports = { getArenas, getArenaById, getMyArenas, getAllArenasAdmin, createArena, updateArena, deleteArena };
