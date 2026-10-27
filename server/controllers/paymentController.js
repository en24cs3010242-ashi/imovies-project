const Payment = require('../models/Payment');
const { processDemoPayment } = require('../services/bookingService');

// @desc    Process a simulated payment (Success, Failed, Cancel)
// @route   POST /api/payments/demo
// @access  Private
const handleDemoPayment = async (req, res, next) => {
  try {
    const { bookingId, action, paymentMethod = 'Demo Card' } = req.body;
    const userId = req.user._id;

    const result = await processDemoPayment(bookingId, userId, action, paymentMethod);

    res.json({
      success: result.success,
      status: result.status,
      message:
        result.status === 'Success'
          ? 'Demo payment verified and booking confirmed!'
          : result.status === 'Failed'
          ? 'Demo payment simulation was declined.'
          : 'Demo payment process cancelled.',
      booking: result.booking,
      payment: result.payment
    });
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};

// @desc    Get payment record by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking');
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    if (
      req.user.role !== 'admin' &&
      payment.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Not authorized to view this payment.'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleDemoPayment,
  getPaymentById
};

