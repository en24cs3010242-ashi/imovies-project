const {
  getShowtimeSeatsStatus,
  holdSeats,
  releaseSeats
} = require('../services/seatService');

// @desc    Get visual seat layout and current reservation status for a showtime
// @route   GET /api/showtimes/:id/seats
// @access  Public (optional auth for identifying user's own reservations)
const getShowtimeSeats = async (req, res, next) => {
  try {
    const showtimeId = req.params.id;
    const currentUserId = req.user ? req.user._id : null;

    const data = await getShowtimeSeatsStatus(showtimeId, currentUserId);

    res.json({
      success: true,
      showtime: data.showtime,
      grid: data.grid,
      summary: data.summary
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Hold seats temporarily (10-minute lock)
// @route   POST /api/showtimes/:id/reservations
// @access  Private
const reserveSeats = async (req, res, next) => {
  try {
    const showtimeId = req.params.id;
    const { seatIdentifiers } = req.body;
    const userId = req.user._id;

    const result = await holdSeats(showtimeId, seatIdentifiers, userId);

    res.status(200).json({
      success: true,
      message: 'Seats temporarily reserved for checkout.',
      reservedSeats: result.reservedSeats,
      expiresAt: result.expiresAt
    });
  } catch (err) {
    // Return 409 conflict when seats are taken
    if (err.message.includes('no longer available')) {
      return res.status(409).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

// @desc    Release held seats
// @route   DELETE /api/showtimes/:id/reservations
// @access  Private
const cancelReservations = async (req, res, next) => {
  try {
    const showtimeId = req.params.id;
    const { seatIdentifiers } = req.body;
    const userId = req.user._id;

    await releaseSeats(showtimeId, userId, seatIdentifiers);

    res.json({
      success: true,
      message: 'Reserved seats released.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShowtimeSeats,
  reserveSeats,
  cancelReservations
};

