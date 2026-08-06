require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const arenaRoutes = require('./routes/arenaRoutes');
const courtRoutes = require('./routes/courtRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const equipmentRentalRoutes = require('./routes/equipmentRentalRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.json({ status: 'ArenaHub API running' }));

app.use('/api', authRoutes);
app.use('/api', arenaRoutes);
app.use('/api', courtRoutes);
app.use('/api', equipmentRoutes);
app.use('/api', bookingRoutes);
app.use('/api', paymentRoutes);
app.use('/api', reviewRoutes);
app.use('/api', equipmentRentalRoutes);
app.use('/api', userRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`ArenaHub API listening on port ${PORT}`));
});
