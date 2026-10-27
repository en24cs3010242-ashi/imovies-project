import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimeService } from '../services/showtimeService';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import SeatGrid from '../components/seats/SeatGrid';
import SeatLegend from '../components/seats/SeatLegend';
import BookingSummaryCard from '../components/seats/BookingSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import { Film, ArrowLeft } from 'lucide-react';
import { formatDate, formatTime } from '../utils/formatters';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    setSelectedShowtime,
    selectedSeats,
    setSelectedSeats,
    toggleSeatSelection,
    setReservationExpiry
  } = useBooking();

  const [showtime, setShowtime] = useState(null);
  const [grid, setGrid] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load seating chart
  const loadSeatData = async () => {
    try {
      setLoading(true);
      const res = await showtimeService.getShowtimeSeats(id);
      setShowtime(res.showtime);
      setSelectedShowtime(res.showtime);
      setGrid(res.grid || []);
      setSummary(res.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatData();
    // Clear previously selected seats when switching showtimes
    setSelectedSeats([]);
  }, [id]);

  const handleToggleSeat = (seat) => {
    // Max 8 tickets per booking for safety
    const alreadySelected = selectedSeats.some((s) => s.seatIdentifier === seat.seatIdentifier);
    if (!alreadySelected && selectedSeats.length >= 8) {
      setError('You can select a maximum of 8 seats per booking transaction.');
      return;
    }
    setError(null);
    toggleSeatSelection(seat);
  };

  const handleProceedCheckout = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat to continue.');
      return;
    }

    if (!isAuthenticated) {
      // Store intent and send to login
      navigate('/login', { state: { from: `/showtimes/${id}/seats` } });
      return;
    }

    try {
      setBookingLoading(true);
      setError(null);

      // Server-side seat reservation hold (10 minutes)
      const seatIds = selectedSeats.map((s) => s.seatIdentifier);
      const res = await showtimeService.reserveSeats(id, seatIds);

      setReservationExpiry(res.expiresAt);
      navigate('/checkout');
    } catch (err) {
      setError(err.message || 'Selected seats could not be reserved. Please select another seat.');
      // Refresh seat chart to reflect newly taken seats
      await loadSeatData();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Rendering interactive cinema seating chart..." />;
  }

  return (
    <div className="container py-3">
      {/* Top Breadcrumb & Info Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-cinema-secondary btn-sm d-inline-flex align-items-center gap-1 mb-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h3 className="text-white fw-bold mb-1">{showtime?.movie?.title}</h3>
          <p className="text-secondary small mb-0">
            {showtime?.theatre?.name} • {showtime?.screen?.name || 'Screen 1'} •{' '}
            {formatDate(showtime?.date)} at {formatTime(showtime?.startTime)}
          </p>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      <div className="row g-4">
        {/* Left: Seat Grid Map */}
        <div className="col-lg-8">
          <div className="cinema-card p-4">
            <SeatLegend />

            <SeatGrid
              grid={grid}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
            />

            <div className="text-center text-muted small mt-4 border-top border-secondary border-opacity-25 pt-3">
              Screen capacity: {summary?.totalSeats || 80} seats • {summary?.bookedCount || 0} sold out
            </div>
          </div>
        </div>

        {/* Right: Booking Summary & Checkout */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '90px' }}>
            <BookingSummaryCard
              showtime={showtime}
              selectedSeats={selectedSeats}
              onRemoveSeat={handleToggleSeat}
              onProceedCheckout={handleProceedCheckout}
              loading={bookingLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
