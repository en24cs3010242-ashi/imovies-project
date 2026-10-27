const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true
    },
    screenNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    seatingCapacity: {
      type: Number,
      default: 72
    },
    seatLayout: {
      rows: {
        type: Number,
        default: 8 // Rows A through H
      },
      columns: {
        type: Number,
        default: 10 // Seats 1 through 10
      },
      tiers: [
        {
          tierName: {
            type: String,
            enum: ['VIP', 'Premium', 'Standard'],
            required: true
          },
          rows: [String], // e.g. ['A', 'B']
          priceMultiplier: {
            type: Number,
            default: 1.0
          }
        }
      ]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of screenNumber per theatre
screenSchema.index({ theatre: 1, screenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Screen', screenSchema);

