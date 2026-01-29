const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  trackHabit
} = require('../controllers/habitController');

// Debug middleware - logowanie requestów
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Habits route: ${req.method} ${req.url}`);
  console.log('Auth header:', req.header('Authorization'));
  next();
});

// Wszystkie trasy wymagają autoryzacji
router.use(authMiddleware);

// CRUD routes
router.post('/', createHabit);
router.get('/', getHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/track', trackHabit);

module.exports = router;