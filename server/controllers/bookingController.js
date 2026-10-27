const Booking = require('../models/Booking');
const {
  createBookingOrder,
  cancelBookingOrder
} = require('../services/bookingService');

// @desc    Create a new booking order
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seatIdentifiers } = req.body;
    const userId = req.user._id;

    const booking = await createBookingOrder(userId, showtimeId, seatIdentifiers);

    const populated = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('showtime');

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Please proceed to payment simulation.',
      booking: populated
    });
  } catch (err) {
    if (err.message.includes('no longer available') || err.message.includes('Conflict')) {
      return res.status(409).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes('past showtimes') || err.message.includes('no longer active')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('showtime')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking by ID (with ownership check)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('showtime')
      .populate('payment')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.'
      });
    }

    // Ownership check: user can only see their own booking unless they are an admin
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You do not have permission to view this booking.'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const { reason } = req.body;

    const cancelledBooking = await cancelBookingOrder(
      bookingId,
      userId,
      isAdmin,
      reason || 'User requested ticket cancellation'
    );

    const populated = await Booking.findById(cancelledBooking._id)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .populate('showtime');

    res.json({
      success: true,
      message: 'Booking has been successfully cancelled and seats released.',
      booking: populated
    });
  } catch (err) {
    if (err.message.includes('within 2 hours') || err.message.includes('already cancelled')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    if (err.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
