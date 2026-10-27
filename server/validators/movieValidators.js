const { body } = require('express-validator');

const movieCreateValidator = [
  body('title').trim().notEmpty().withMessage('Movie title is required'),
  body('description').trim().notEmpty().withMessage('Movie description is required'),
  body('genre').isArray({ min: 1 }).withMessage('At least one genre is required'),
  body('language').isArray({ min: 1 }).withMessage('At least one language is required'),
  body('duration')
    .isNumeric()
    .withMessage('Duration must be a number in minutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be greater than 0'),
  body('releaseDate').notEmpty().withMessage('Release date is required'),
  body('posterUrl').trim().notEmpty().withMessage('Movie poster URL is required')
];

module.exports = {
  movieCreateValidator
};

