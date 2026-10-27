const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { movieCreateValidator } = require('../validators/movieValidators');

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.post('/', protect, authorizeAdmin, movieCreateValidator, validate, createMovie);
router.put('/:id', protect, authorizeAdmin, updateMovie);
router.delete('/:id', protect, authorizeAdmin, deleteMovie);

module.exports = router;

