import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import {
  Ticket,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Film,
  ArrowLeft,
  XCircle,
  CreditCard,
  User
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingById(id);
      setBooking(res.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancelling(true);
      setError(null);
      await bookingService.cancelBooking(id, 'User cancelled booking');
      setSuccessMessage('Booking cancelled and seats freed.');
      await fetchBooking();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving digital ticket details..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <AlertBanner type="danger" message={error || 'Booking could not be found.'} />
        <Link to="/my-bookings" className="btn btn-cinema-primary">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const isFutureShow =
    booking.showtime &&
    new Date(`${booking.showtime.date}T${booking.showtime.startTime}:00`) > new Date();
  const canCancel = isFutureShow && booking.bookingStatus === 'Confirmed';

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-cinema-secondary btn-sm d-inline-flex align-items-center gap-1 mb-2"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h3 className="text-white fw-bold mb-0">Booking Details</h3>
        </div>

        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-cinema-secondary btn-sm">
            <Printer size={15} /> Print
          </button>
          {canCancel && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="btn btn-cinema-danger btn-sm"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="cinema-ticket p-4 p-md-5 mb-4 position-relative">
            <div className="ticket-notch-left"></div>
            <div className="ticket-notch-right"></div>

            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-25">
              <span className="brand-logo fs-5">IMOVIES PASS</span>
              <span
                className={`badge px-3 py-1 ${
                  booking.bookingStatus === 'Confirmed'
                    ? 'bg-success bg-opacity-25 text-success border border-success'
                    : booking.bookingStatus === 'Cancelled'
                    ? 'bg-danger bg-opacity-25 text-danger border border-danger'
                    : 'bg-warning bg-opacity-25 text-warning border border-warning'
                }`}
              >
                {booking.bookingStatus?.toUpperCase()}
              </span>
            </div>

            <div className="row g-4 align-items-center my-3">
              <div className="col-sm-4 text-center text-sm-start">
                <img
                  src={booking.movie?.posterUrl}
                  alt={booking.movie?.title}
                  className="rounded-3 shadow w-100"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>

              <div className="col-sm-8">
                <h4 className="text-white fw-bold mb-2">{booking.movie?.title}</h4>
                <p className="text-secondary small mb-3">
                  <MapPin size={14} className="text-primary me-1" />
                  {booking.theatre?.name} ({booking.theatre?.city})
                </p>

                <div className="row g-3 small text-secondary">
                  <div className="col-6">
                    <span className="text-muted d-block">Screen</span>
                    <strong className="text-white">{booking.screen?.name || 'Screen 1'}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Tickets</span>
                    <strong className="text-white">{booking.ticketQuantity} Seats</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Show Date</span>
                    <strong className="text-white">{formatDate(booking.showtime?.date)}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Start Time</span>
                    <strong className="text-white">{formatTime(booking.showtime?.startTime)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-perforation"></div>

            {/* Seats & Price Breakdown */}
            <div className="row g-3">
              <div className="col-sm-7">
                <span className="text-muted small d-block mb-1">Seats Allocated</span>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {booking.seats?.map((s) => (
                    <span key={s.seatIdentifier} className="badge bg-primary px-3 py-1 fs-6">
                      {s.seatIdentifier} ({s.tier})
                    </span>
                  ))}
                </div>

                <div className="small text-secondary">
                  <div>Booking Reference: <strong className="text-white">{booking.bookingReference}</strong></div>
                  <div>Payment Status: <strong className="text-white">{booking.paymentStatus}</strong></div>
                  {booking.payment?.transactionId && (
                    <div>Transaction Ref: <span className="text-muted font-monospace">{booking.payment.transactionId}</span></div>
                  )}
                </div>
              </div>

              <div className="col-sm-5 text-sm-end border-sm-start border-secondary border-opacity-25 ps-sm-3">
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Subtotal:</span>
                  <span className="text-white">{formatCurrency(booking.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Convenience Fee:</span>
                  <span className="text-white">{formatCurrency(booking.convenienceFee)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small mb-2">
                  <span>Tax (5%):</span>
                  <span className="text-white">{formatCurrency(booking.tax)}</span>
                </div>
                <div className="d-flex justify-content-between text-white fw-bold border-top border-secondary border-opacity-25 pt-2 fs-5">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

