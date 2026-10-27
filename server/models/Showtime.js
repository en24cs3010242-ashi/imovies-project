const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Please specify the movie'],
      index: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Please specify the theatre'],
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Please specify the screen']
    },
    date: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please provide the show date'],
      index: true
    },
    startTime: {
      type: String, // e.g. "14:30"
      required: [true, 'Please provide the start time']
    },
    endTime: {
      type: String, // e.g. "17:15"
      default: ''
    },
    price: {
      standard: {
        type: Number,
        required: true,
        default: 12.0
      },
      premium: {
        type: Number,
        required: true,
        default: 16.0
      },
      vip: {
        type: Number,
        required: true,
        default: 22.0
      }
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Completed'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent conflicting showtimes on the exact same screen, date, and startTime
showtimeSchema.index({ theatre: 1, screen: 1, date: 1, startTime: 1 }, { unique: true });
showtimeSchema.index({ movie: 1, date: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);

