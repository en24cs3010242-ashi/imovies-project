const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const SeatReservation = require('../models/SeatReservation');
const Payment = require('../models/Payment');
const { getSeatTier } = require('./seatService');
const { generateBookingReference, generateTransactionId } = require('../utils/bookingReference');

/**
 * Creates a new pending booking with strict server-side price calculation.
 */
const createBookingOrder = async (userId, showtimeId, seatIdentifiers) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('movie')
    .populate('theatre')
    .populate('screen');

  if (!showtime) {
    throw new Error('Showtime not found');
  }

  if (showtime.status !== 'Active') {
    throw new Error('This showtime is no longer active for booking');
  }

  // Check show date is not in the past
  const now = new Date();
  const showDateTimeStr = `${showtime.date}T${showtime.startTime}:00`;
  const showDate = new Date(showDateTimeStr);
  if (showDate < now) {
    throw new Error('Cannot book tickets for past showtimes');
  }

  const screen = showtime.screen;
  const seatsData = [];
  let subtotal = 0;

  for (const seatId of seatIdentifiers) {
    const row = seatId.charAt(0).toUpperCase();
    const col = parseInt(seatId.slice(1), 10);
    const tier = getSeatTier(row, screen);
    const tierKey = tier.toLowerCase();
    const price = showtime.price[tierKey] || showtime.price.standard;

    seatsData.push({
      seatIdentifier: seatId,
      row,
      col,
      tier,
      price
    });
    subtotal += price;
  }

  // Fees and taxes
  const convenienceFee = parseFloat((seatsData.length * 1.50).toFixed(2));
  const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% cinema entertainment tax
  const totalAmount = parseFloat((subtotal + convenienceFee + tax).toFixed(2));

  // Server-side seat check
  const conflicts = await SeatReservation.find({
    showtime: showtimeId,
    seatIdentifier: { $in: seatIdentifiers },
    $or: [
      { status: 'booked' },
      {
        status: 'reserved',
        user: { $ne: userId },
        expiresAt: { $gt: now }
      }
    ]
  });

  if (conflicts.length > 0) {
    const conflicted = conflicts.map(c => c.seatIdentifier).join(', ');
    throw new Error(`Seats ${conflicted} are no longer available for booking`);
  }

  // Ensure current user has reserved them
  const holdExpiry = new Date(now.getTime() + 10 * 60 * 1000);
  await SeatReservation.deleteMany({
    showtime: showtimeId,
    user: userId,
    status: 'reserved'
  });

  await SeatReservation.insertMany(
    seatIdentifiers.map(seatIdentifier => ({
      showtime: showtimeId,
      seatIdentifier,
      user: userId,
      status: 'reserved',
      expiresAt: holdExpiry
    }))
  );

  const bookingReference = generateBookingReference();

  const booking = await Booking.create({
    bookingReference,
    user: userId,
    movie: showtime.movie._id,
    theatre: showtime.theatre._id,
    screen: showtime.screen._id,
    showtime: showtime._id,
    seats: seatsData,
    ticketQuantity: seatsData.length,
    subtotal,
    convenienceFee,
    tax,
    totalAmount,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending'
  });

  return booking;
};

/**
 * Confirms payment and completes booking
 */
const processDemoPayment = async (bookingId, userId, action, paymentMethod = 'Demo Card') => {
  const booking = await Booking.findById(bookingId)
    .populate('movie')
    .populate('theatre')
    .populate('screen')
    .populate('showtime');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized access to this booking');
  }

  if (booking.bookingStatus === 'Confirmed' && booking.paymentStatus === 'Paid') {
    return { booking, alreadyConfirmed: true };
  }

  const transactionId = generateTransactionId();

  if (action === 'cancel') {
    // Release seats
    await SeatReservation.deleteMany({
      showtime: booking.showtime._id,
      user: userId,
      status: 'reserved'
    });

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Failed';
    booking.cancellationReason = 'User cancelled demo payment';
    await booking.save();

    await Payment.create({
      booking: booking._id,
      user: userId,
      amount: booking.totalAmount,
      currency: 'USD',
      paymentMethod,
      transactionId,
      status: 'Cancelled',
      isDemo: true,
      gatewayResponse: { message: 'Demo payment cancelled by user' }
    });

    return {
      success: false,
      status: 'Cancelled',
      booking
    };
  }

  if (action === 'failed') {
    booking.paymentStatus = 'Failed';
    await booking.save();

    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount: booking.totalAmount,
      currency: 'USD',
      paymentMethod,
      transactionId,
      status: 'Failed',
      isDemo: true,
      gatewayResponse: { message: 'Demo bank simulation declined transaction (insufficient test funds)' }
    });

    return {
      success: false,
      status: 'Failed',
      booking,
      payment
    };
  }

  if (action === 'success') {
    // Record payment
    const payment = await Payment.create({
      booking: booking._id,
      user: userId,
      amount: booking.totalAmount,
      currency: 'USD',
      paymentMethod,
      transactionId,
      status: 'Success',
      isDemo: true,
      gatewayResponse: {
        message: 'Demo transaction authorized successfully',
        authCode: 'AUTH-DEMO-OK'
      }
    });

    // Update seat reservations to 'booked' and link booking
    const seatIds = booking.seats.map(s => s.seatIdentifier);
    await SeatReservation.updateMany(
      {
        showtime: booking.showtime._id,
        seatIdentifier: { $in: seatIds },
        user: userId
      },
      {
        $set: {
          status: 'booked',
          booking: booking._id
        }
      }
    );

    booking.bookingStatus = 'Confirmed';
    booking.paymentStatus = 'Paid';
    booking.payment = payment._id;
    await booking.save();

    return {
      success: true,
      status: 'Success',
      booking,
      payment
    };
  }

  throw new Error('Invalid payment action specified');
};

/**
 * Cancels a confirmed booking and frees seats
 */
const cancelBookingOrder = async (bookingId, userId, isAdmin = false, reason = 'User requested cancellation') => {
  const booking = await Booking.findById(bookingId).populate('showtime');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!isAdmin && booking.user.toString() !== userId.toString()) {
    throw new Error('Unauthorized to cancel this booking');
  }

  if (booking.bookingStatus === 'Cancelled') {
    throw new Error('Booking is already cancelled');
  }

  // Check cancellation policy: must be at least 2 hours before showtime
  if (!isAdmin && booking.showtime) {
    const showDateTime = new Date(`${booking.showtime.date}T${booking.showtime.startTime}:00`);
    const now = new Date();
    const diffHours = (showDateTime - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      throw new Error('Bookings cannot be cancelled within 2 hours of showtime');
    }
  }

  // Release the booked seats
  const seatIds = booking.seats.map(s => s.seatIdentifier);
  await SeatReservation.deleteMany({
    showtime: booking.showtime._id,
    seatIdentifier: { $in: seatIds }
  });

  booking.bookingStatus = 'Cancelled';
  booking.paymentStatus = booking.paymentStatus === 'Paid' ? 'Refunded' : 'Failed';
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  return booking;
};

module.exports = {
  createBookingOrder,
  processDemoPayment,
  cancelBookingOrder
};

