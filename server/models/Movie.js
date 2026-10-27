const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description']
    },
    genre: {
      type: [String],
      required: [true, 'Please specify at least one genre'],
      index: true
    },
    language: {
      type: [String],
      required: [true, 'Please specify at least one language'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'],
      min: [1, 'Duration must be at least 1 minute']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    releaseDate: {
      type: Date,
      required: [true, 'Please provide a release date']
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster image URL']
    },
    bannerUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    director: {
      type: String,
      default: ''
    },
    cast: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Now Showing', 'Coming Soon', 'Archived'],
      default: 'Now Showing',
      index: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Instruct text index not to use the 'language' field as a stemming override
movieSchema.index(
  { title: 'text', description: 'text' },
  { language_override: 'none', default_language: 'english' }
);

module.exports = mongoose.model('Movie', movieSchema);

