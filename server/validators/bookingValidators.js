const { body } = require('express-validator');

const reservationValidator = [
  body('seatIdentifiers')
    .isArray({ min: 1 })
    .withMessage('Must select at least one seat to reserve'),
  body('seatIdentifiers.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Invalid seat identifier format')
];

const bookingCreateValidator = [
  body('showtimeId').isMongoId().withMessage('Valid showtime ID is required'),
  body('seatIdentifiers')
    .isArray({ min: 1 })
    .withMessage('At least one seat identifier must be provided'),
  body('seatIdentifiers.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Invalid seat identifier format')
];

const demoPaymentValidator = [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('action')
    .isIn(['success', 'failed', 'cancel'])
    .withMessage('Action must be one of: success, failed, cancel'),
  body('paymentMethod')
    .optional()
    .isIn(['Demo Card', 'Demo UPI', 'Demo NetBanking'])
    .withMessage('Invalid payment method')
];

module.exports = {
  reservationValidator,
  bookingCreateValidator,
  demoPaymentValidator
};

