const crypto = require('crypto');

/**
 * Generates an alphanumeric booking reference like IMV-A8F4D2
 */
const generateBookingReference = () => {
  const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `IMV-${randomChars}`;
};

/**
 * Generates a unique demo transaction ID like TXN-DEMO-982341
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-DEMO-${timestamp}-${random}`;
};

module.exports = {
  generateBookingReference,
  generateTransactionId
};

