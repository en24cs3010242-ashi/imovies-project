const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');

// @desc    Get all theatres with screens
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city && city !== 'All') {
      query.city = city;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const theatres = await Theatre.find(query).sort({ city: 1, name: 1 });

    // Fetch screens for each theatre
    const theatreIds = theatres.map(t => t._id);
    const screens = await Screen.find({ theatre: { $in: theatreIds }, isActive: true });

    const screensByTheatre = {};
    screens.forEach(s => {
      const tId = s.theatre.toString();
      if (!screensByTheatre[tId]) screensByTheatre[tId] = [];
      screensByTheatre[tId].push(s);
    });

    const theatresWithScreens = theatres.map(t => ({
      ...t.toObject(),
      screens: screensByTheatre[t._id.toString()] || []
    }));

    res.json({
      success: true,
      count: theatresWithScreens.length,
      theatres: theatresWithScreens
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }

    const screens = await Screen.find({ theatre: theatre._id, isActive: true });
    const today = new Date().toISOString().split('T')[0];
    const showtimes = await Showtime.find({
      theatre: theatre._id,
      date: { $gte: today },
      status: 'Active'
    }).populate('movie').populate('screen');

    res.json({
      success: true,
      theatre: {
        ...theatre.toObject(),
        screens,
        showtimes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    // Auto-create default Screen 1
    const defaultScreen = await Screen.create({
      theatre: theatre._id,
      screenNumber: 1,
      name: 'Screen 1 - Standard Cinema',
      seatingCapacity: 80,
      seatLayout: {
        rows: 8,
        columns: 10,
        tiers: [
          { tierName: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
          { tierName: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
          { tierName: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 }
        ]
      }
    });

    res.status(201).json({
      success: true,
      message: 'Theatre and default screen created successfully.',
      theatre: {
        ...theatre.toObject(),
        screens: [defaultScreen]
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a theatre
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }

    res.json({
      success: true,
      message: 'Theatre updated successfully.',
      theatre
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }

    theatre.isActive = false;
    await theatre.save();

    await Screen.updateMany({ theatre: theatre._id }, { $set: { isActive: false } });
    await Showtime.updateMany({ theatre: theatre._id }, { $set: { status: 'Cancelled' } });

    res.json({
      success: true,
      message: 'Theatre and associated screens deactivated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a screen to a theatre
// @route   POST /api/theatres/:id/screens
// @access  Private/Admin
const createScreen = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.'
      });
    }

    const { screenNumber, name, seatingCapacity, seatLayout } = req.body;

    const screen = await Screen.create({
      theatre: theatre._id,
      screenNumber: screenNumber || (await Screen.countDocuments({ theatre: theatre._id })) + 1,
      name: name || `Screen ${screenNumber}`,
      seatingCapacity: seatingCapacity || 80,
      seatLayout: seatLayout || {
        rows: 8,
        columns: 10,
        tiers: [
          { tierName: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
          { tierName: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
          { tierName: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 }
        ]
      }
    });

    res.status(201).json({
      success: true,
      message: 'Screen added successfully.',
      screen
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  createScreen
};

