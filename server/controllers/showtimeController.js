const Showtime = require('../models/Showtime');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const Screen = require('../models/Screen');

// @desc    Get showtimes with filtering
// @route   GET /api/showtimes
// @access  Public
const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, theatreId, date, city, status = 'Active' } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (movieId) {
      query.movie = movieId;
    }

    if (theatreId) {
      query.theatre = theatreId;
    }

    if (date) {
      query.date = date;
    } else {
      // Default to upcoming/today onwards if not specified
      const today = new Date().toISOString().split('T')[0];
      query.date = { $gte: today };
    }

    if (city && city !== 'All') {
      const theatresInCity = await Theatre.find({ city, isActive: true }).select('_id');
      const theatreIds = theatresInCity.map(t => t._id);
      query.theatre = { $in: theatreIds };
    }

    const showtimes = await Showtime.find(query)
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: showtimes.length,
      showtimes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single showtime by ID
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.'
      });
    }

    res.json({
      success: true,
      showtime
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new showtime
// @route   POST /api/showtimes
// @access  Private/Admin
const createShowtime = async (req, res, next) => {
  try {
    const { movie, theatre, screen, date, startTime, endTime, price, status } = req.body;

    // Check past date
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule a showtime in the past.'
      });
    }

    // Verify movie, theatre, screen exist
    const [movieDoc, theatreDoc, screenDoc] = await Promise.all([
      Movie.findById(movie),
      Theatre.findById(theatre),
      Screen.findById(screen)
    ]);

    if (!movieDoc || !theatreDoc || !screenDoc) {
      return res.status(400).json({
        success: false,
        message: 'Specified movie, theatre, or screen does not exist.'
      });
    }

    // Check for conflicting schedule on the same screen at the same start time
    const conflict = await Showtime.findOne({
      theatre,
      screen,
      date,
      startTime,
      status: { $ne: 'Cancelled' }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Conflict detected: Screen ${screenDoc.screenNumber} is already booked for another show at ${startTime} on ${date}.`
      });
    }

    const showtime = await Showtime.create({
      movie,
      theatre,
      screen,
      date,
      startTime,
      endTime: endTime || '',
      price: price || { standard: 12.0, premium: 16.0, vip: 22.0 },
      status: status || 'Active'
    });

    const populatedShowtime = await Showtime.findById(showtime._id)
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully.',
      showtime: populatedShowtime
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a showtime
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
const updateShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.'
      });
    }

    const updated = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('movie')
      .populate('theatre')
      .populate('screen');

    res.json({
      success: true,
      message: 'Showtime updated successfully.',
      showtime: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Cancel a showtime
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.'
      });
    }

    showtime.status = 'Cancelled';
    await showtime.save();

    res.json({
      success: true,
      message: 'Showtime marked as cancelled.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
};

