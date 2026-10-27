const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get administrative dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalShowtimes,
      totalBookings,
      revenueResult,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      Theatre.countDocuments({ isActive: true }),
      Showtime.countDocuments({ status: 'Active' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { bookingStatus: 'Confirmed', paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.find()
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl')
        .populate('theatre', 'name city')
        .populate('showtime', 'date startTime')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalShowtimes,
        totalBookings,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      recentBookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings with filters & pagination
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingReference = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city')
      .populate('screen', 'screenNumber name')
      .populate('showtime', 'date startTime price')
      .populate('payment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Aggregate booking count per user
    const userBookings = await Booking.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
    ]);

    const bookingStatsMap = {};
    userBookings.forEach(b => {
      bookingStatsMap[b._id.toString()] = {
        bookingCount: b.count,
        totalSpent: parseFloat(b.totalSpent.toFixed(2))
      };
    });

    const enrichedUsers = users.map(u => ({
      ...u.toObject(),
      bookingCount: bookingStatsMap[u._id.toString()]?.bookingCount || 0,
      totalSpent: bookingStatsMap[u._id.toString()]?.totalSpent || 0
    }));

    res.json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role or status
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent admin from demoting or disabling their own account
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot alter your own administrative role or status.'
      });
    }

    if (role && ['user', 'admin'].includes(role)) {
      targetUser.role = role;
    }

    if (typeof isActive === 'boolean') {
      targetUser.isActive = isActive;
    }

    await targetUser.save();

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  updateUserStatus
};

