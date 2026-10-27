import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { bookingService } from '../services/bookingService';
import AlertBanner from '../components/common/AlertBanner';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const Checkout = () => {
  const { user } = useAuth();
  const { selectedShowtime, selectedSeats, setBookingOrder } = useBooking();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If no showtime or seats selected, redirect back to movies
  if (!selectedShowtime || selectedSeats.length === 0) {
    return <Navigate to="/movies" replace />;
  }

  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = selectedSeats.length * 1.50;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + convenienceFee + tax;

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const seatIds = selectedSeats.map((s) => s.seatIdentifier);
      const res = await bookingService.createBooking(selectedShowtime._id, seatIds);

      setBookingOrder(res.booking);
      navigate(`/payment?bookingId=${res.booking._id}`);
    } catch (err) {
      setError(err.message || 'Unable to initialize booking order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-cinema-secondary btn-sm d-inline-flex align-items-center gap-1 mb-2"
          >
            <ArrowLeft size={14} /> Back to Seating
          </button>
          <h2 className="text-white fw-bold mb-0">Booking Checkout</h2>
        </div>
        <div className="d-flex align-items-center gap-2 text-warning small bg-warning bg-opacity-10 px-3 py-1 rounded border border-warning border-opacity-25">
          <ShieldCheck size={16} />
          <span>Demo Payment Mode</span>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      <div className="row g-4">
        {/* Left: Contact Details & Order Summary */}
        <div className="col-lg-8">
          {/* Customer Info Card */}
          <div className="cinema-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              1. Attendee Contact Details
            </h5>
            <div className="row g-3 small">
              <div className="col-md-6">
                <span className="text-secondary d-block">Full Name</span>
                <strong className="text-white fs-6">{user?.name}</strong>
              </div>
              <div className="col-md-6">
                <span className="text-secondary d-block">Email Address (E-Ticket Recipient)</span>
                <strong className="text-white fs-6">{user?.email}</strong>
              </div>
              <div className="col-md-6">
                <span className="text-secondary d-block">Phone Number</span>
                <strong className="text-white fs-6">{user?.phone || 'Not provided'}</strong>
              </div>
              <div className="col-md-6">
                <span className="text-secondary d-block">Account Status</span>
                <span className="badge bg-success bg-opacity-25 text-success">Verified User</span>
              </div>
            </div>
          </div>

          {/* Movie & Show Info Card */}
          <div className="cinema-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              2. Cinema Showtime Details
            </h5>

            <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
              <img
                src={selectedShowtime.movie?.posterUrl}
                alt={selectedShowtime.movie?.title}
                className="rounded-3 shadow"
                style={{ width: '100px', height: '140px', objectFit: 'cover' }}
              />

              <div className="flex-grow-1">
                <h4 className="text-white fw-bold mb-2">{selectedShowtime.movie?.title}</h4>
                <div className="d-flex flex-wrap gap-3 text-secondary small mb-3">
                  <span className="d-flex align-items-center gap-1 text-light">
                    <MapPin size={14} className="text-primary" />
                    {selectedShowtime.theatre?.name} ({selectedShowtime.theatre?.city})
                  </span>
                  <span>•</span>
                  <span className="badge bg-primary bg-opacity-25 text-primary">
                    {selectedShowtime.screen?.name || 'Screen 1'}
                  </span>
                </div>

                <div className="d-flex flex-wrap gap-4 text-secondary small">
                  <div>
                    <span className="text-muted d-block small">Date</span>
                    <strong className="text-white d-flex align-items-center gap-1">
                      <Calendar size={13} /> {formatDate(selectedShowtime.date)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted d-block small">Start Time</span>
                    <strong className="text-white d-flex align-items-center gap-1">
                      <Clock size={13} /> {formatTime(selectedShowtime.startTime)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted d-block small">Reserved Seats ({selectedSeats.length})</span>
                    <strong className="text-primary fs-6">
                      {selectedSeats.map((s) => s.seatIdentifier).join(', ')}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateway Safety Notice */}
          <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 small text-secondary">
            <h6 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
              <ShieldCheck size={16} className="text-warning" />
              Demo Simulation Environment
            </h6>
            This application uses a mock payment workflow. When proceeding to the next step, you can safely test payment success, card decline, and cancellation without entering actual financial credentials.
          </div>
        </div>

        {/* Right: Payment Calculation Card */}
        <div className="col-lg-4">
          <div className="cinema-card p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              Payment Summary
            </h5>

            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex justify-content-between small text-secondary">
                <span>Tickets ({selectedSeats.length} × Seats)</span>
                <span className="text-white fw-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {selectedSeats.map((s) => (
                <div key={s.seatIdentifier} className="d-flex justify-content-between small text-muted ps-3">
                  <span>Seat {s.seatIdentifier} ({s.tier})</span>
                  <span>{formatCurrency(s.price)}</span>
                </div>
              ))}

              <div className="d-flex justify-content-between small text-secondary pt-2 border-top border-secondary border-opacity-10">
                <span>Convenience Fee ($1.50 per seat)</span>
                <span className="text-white">{formatCurrency(convenienceFee)}</span>
              </div>

              <div className="d-flex justify-content-between small text-secondary">
                <span>Cinema Entertainment Tax (5%)</span>
                <span className="text-white">{formatCurrency(tax)}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 text-white fw-bold">
                <span className="fs-6">Total Amount</span>
                <span className="text-primary fs-4">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleInitiatePayment}
              disabled={loading}
              className="btn btn-cinema-primary w-100 justify-content-center py-2"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <>
                  <CreditCard size={18} />
                  <span>Proceed to Demo Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

