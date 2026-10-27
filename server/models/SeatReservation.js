const mongoose = require('mongoose');

const seatReservationSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true
    },
    seatIdentifier: {
      type: String, // e.g. "C4", "A10"
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['reserved', 'booked', 'released'],
      default: 'reserved',
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Automatic MongoDB TTL cleanup when expired
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee uniqueness for an active reservation or booking
seatReservationSchema.index({ showtime: 1, seatIdentifier: 1 });

module.exports = mongoose.model('SeatReservation', seatReservationSchema);

