const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theatre name'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide address/location'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food Court', 'Wheelchair Accessible']
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

module.exports = mongoose.model('Theatre', theatreSchema);

