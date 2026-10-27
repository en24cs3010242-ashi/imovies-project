const express = require('express');
const router = express.Router();
const SeatReservation = require('../models/SeatReservation');
const { protect } = require('../middleware/authMiddleware');

// @desc    Delete/Release a reservation by ID
// @route   DELETE /api/reservations/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const reservation = await SeatReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    if (
      req.user.role !== 'admin' &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to release this reservation.'
      });
    }

    await reservation.deleteOne();

    res.json({
      success: true,
      message: 'Reservation released successfully.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

