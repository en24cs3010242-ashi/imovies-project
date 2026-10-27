const express = require('express');
const router = express.Router();
const { handleDemoPayment, getPaymentById } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { demoPaymentValidator } = require('../validators/bookingValidators');

router.post('/demo', protect, demoPaymentValidator, validate, handleDemoPayment);
router.get('/:id', protect, getPaymentById);

module.exports = router;

