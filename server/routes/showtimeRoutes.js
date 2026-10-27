const express = require('express');
const router = express.Router();
const {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
} = require('../controllers/showtimeController');
const {
  getShowtimeSeats,
  reserveSeats,
  cancelReservations
} = require('../controllers/seatReservationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { reservationValidator } = require('../validators/bookingValidators');

// Showtime discovery
router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);
router.post('/', protect, authorizeAdmin, createShowtime);
router.put('/:id', protect, authorizeAdmin, updateShowtime);
router.delete('/:id', protect, authorizeAdmin, deleteShowtime);

// Seat reservation sub-routes
// Optional auth for seats GET (so user's holds show as 'selected' if logged in)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/:id/seats', optionalAuth, getShowtimeSeats);
router.post('/:id/reservations', protect, reservationValidator, validate, reserveSeats);
router.delete('/:id/reservations', protect, cancelReservations);

module.exports = router;

