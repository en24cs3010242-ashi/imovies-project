const SeatReservation = require('../models/SeatReservation');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');

/**
 * Determines the tier for a given row in a screen layout.
 * Rows A, B -> VIP
 * Rows C, D, E -> Premium
 * Rows F, G, H -> Standard
 */
const getSeatTier = (row, screen) => {
  if (screen && screen.seatLayout && screen.seatLayout.tiers) {
    for (const t of screen.seatLayout.tiers) {
      if (t.rows && t.rows.includes(row)) {
        return t.tierName;
      }
    }
  }
  // Fallback defaults
  if (row === 'A' || row === 'B') return 'VIP';
  if (row === 'C' || row === 'D' || row === 'E') return 'Premium';
  return 'Standard';
};

/**
 * Gets the seat status map and complete seat grid for a showtime.
 */
const getShowtimeSeatsStatus = async (showtimeId, currentUserId = null) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('screen')
    .populate('theatre')
    .populate('movie');

  if (!showtime) {
    throw new Error('Showtime not found');
  }

  const screen = showtime.screen;
  const rowsCount = screen?.seatLayout?.rows || 8;
  const colsCount = screen?.seatLayout?.columns || 10;
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, rowsCount);

  // Find all active reservations and bookings
  const now = new Date();
  const activeReservations = await SeatReservation.find({
    showtime: showtimeId,
    $or: [
      { status: 'booked' },
      { status: 'reserved', expiresAt: { $gt: now } }
    ]
  });

  const seatStatusMap = {};
  activeReservations.forEach(r => {
    if (r.status === 'booked') {
      seatStatusMap[r.seatIdentifier] = {
        status: 'booked',
        reservedByCurrentUser: false
      };
    } else if (r.status === 'reserved') {
      const isMine = currentUserId && r.user.toString() === currentUserId.toString();
      seatStatusMap[r.seatIdentifier] = {
        status: isMine ? 'selected_by_me' : 'reserved',
        reservedByCurrentUser: !!isMine,
        expiresAt: r.expiresAt
      };
    }
  });

  // Build grid layout
  const grid = [];
  for (const row of rowLetters) {
    const tier = getSeatTier(row, screen);
    const rowSeats = [];
    const price = showtime.price[tier.toLowerCase()] || showtime.price.standard;

    for (let col = 1; col <= colsCount; col++) {
      const seatId = `${row}${col}`;
      const seatInfo = seatStatusMap[seatId];
      let state = 'available';

      if (seatInfo) {
        if (seatInfo.status === 'booked') {
          state = 'booked';
        } else if (seatInfo.status === 'selected_by_me') {
          state = 'selected';
        } else {
          state = 'reserved';
        }
      }

      rowSeats.push({
        seatIdentifier: seatId,
        row,
        col,
        tier,
        price,
        status: state
      });
    }
    grid.push({
      row,
      tier,
      price,
      seats: rowSeats
    });
  }

  return {
    showtime,
    grid,
    summary: {
      totalSeats: rowsCount * colsCount,
      bookedCount: Object.values(seatStatusMap).filter(s => s.status === 'booked').length,
      reservedCount: Object.values(seatStatusMap).filter(s => s.status === 'reserved').length
    }
  };
};

/**
 * Reserve seats temporarily with a 10-minute hold window.
 */
const holdSeats = async (showtimeId, seatIdentifiers, userId) => {
  const now = new Date();
  const holdExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

  // Check if any seat is already booked or reserved by another user
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
    const conflictedSeats = conflicts.map(c => c.seatIdentifier).join(', ');
    throw new Error(`The following seats are no longer available: ${conflictedSeats}`);
  }

  // Release previous unconfirmed holds for this user on this showtime
  await SeatReservation.deleteMany({
    showtime: showtimeId,
    user: userId,
    status: 'reserved'
  });

  // Insert fresh reservations
  const reservations = seatIdentifiers.map(seatIdentifier => ({
    showtime: showtimeId,
    seatIdentifier,
    user: userId,
    status: 'reserved',
    expiresAt: holdExpiry
  }));

  await SeatReservation.insertMany(reservations);
  return {
    success: true,
    reservedSeats: seatIdentifiers,
    expiresAt: holdExpiry
  };
};

/**
 * Release seats held by a user
 */
const releaseSeats = async (showtimeId, userId, seatIdentifiers = null) => {
  const query = {
    showtime: showtimeId,
    user: userId,
    status: 'reserved'
  };
  if (seatIdentifiers && seatIdentifiers.length > 0) {
    query.seatIdentifier = { $in: seatIdentifiers };
  }
  await SeatReservation.deleteMany(query);
};

module.exports = {
  getSeatTier,
  getShowtimeSeatsStatus,
  holdSeats,
  releaseSeats
};

