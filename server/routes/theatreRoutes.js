const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  createScreen
} = require('../controllers/theatreController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/adminMiddleware');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, authorizeAdmin, createTheatre);
router.put('/:id', protect, authorizeAdmin, updateTheatre);
router.delete('/:id', protect, authorizeAdmin, deleteTheatre);
router.post('/:id/screens', protect, authorizeAdmin, createScreen);

module.exports = router;

