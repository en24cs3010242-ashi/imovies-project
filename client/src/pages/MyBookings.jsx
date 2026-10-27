import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  AlertTriangle,
  Eye,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Cancellation modal state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of personal schedule');
  const [cancelling, setCancelling] = useState(false);

  // Tab filter: 'all' | 'upcoming' | 'past' | 'cancelled'
  const [activeTab, setActiveTab] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      setBookings(res.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelSubmit = async () => {
    if (!selectedBookingForCancel) return;
    try {
      setCancelling(true);
      setError(null);
      await bookingService.cancelBooking(selectedBookingForCancel._id, cancelReason);
      setSuccessMessage(`Booking ${selectedBookingForCancel.bookingReference} successfully cancelled.`);
      setSelectedBookingForCancel(null);
      await fetchBookings();
    } catch (err) {
      setError(err.message || 'Unable to cancel this booking.');
    } finally {
      setCancelling(false);
    }
  };

  // Determine if a booking is in the future
  const isUpcoming = (b) => {
    if (b.bookingStatus === 'Cancelled') return false;
    if (!b.showtime) return false;
    const showDateTime = new Date(`${b.showtime.date}T${b.showtime.startTime}:00`);
    return showDateTime >= new Date();
  };

  // Filter bookings according to active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'upcoming') return isUpcoming(b);
    if (activeTab === 'past') return !isUpcoming(b) && b.bookingStatus !== 'Cancelled';
    if (activeTab === 'cancelled') return b.bookingStatus === 'Cancelled';
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Retrieving booking history..." />;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Tickets & Reservations</span>
          <h2 className="text-white fw-bold mb-0">My Bookings</h2>
        </div>
        <Link to="/movies" className="btn btn-cinema-primary">
          <Ticket size={16} /> Book More Tickets
        </Link>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`filter-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          Upcoming Shows ({bookings.filter(isUpcoming).length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`filter-pill ${activeTab === 'past' ? 'active' : ''}`}
        >
          Past Shows
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`filter-pill ${activeTab === 'cancelled' ? 'active' : ''}`}
        >
          Cancelled ({bookings.filter((b) => b.bookingStatus === 'Cancelled').length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <Ticket size={48} className="text-secondary mb-3 opacity-50" />
          <h4 className="text-white fw-bold mb-2">No Bookings Found</h4>
          <p className="text-secondary small mb-4">
            You don't have any tickets in this category.
          </p>
          <Link to="/movies" className="btn btn-cinema-primary">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredBookings.map((b) => {
            const canCancel = isUpcoming(b) && b.bookingStatus === 'Confirmed';

            return (
              <div key={b._id} className="cinema-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-secondary font-monospace px-3 py-2 fs-6">
                      {b.bookingReference}
                    </span>
                    <span className="text-secondary small">
                      Booked on {formatDate(b.createdAt)}
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="d-flex align-items-center gap-2">
                    {b.bookingStatus === 'Confirmed' && (
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-1">
                        CONFIRMED
                      </span>
                    )}
                    {b.bookingStatus === 'Cancelled' && (
                      <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-3 py-1">
                        CANCELLED
                      </span>
                    )}
                    {b.bookingStatus === 'Pending' && (
                      <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25 px-3 py-1">
                        PENDING PAYMENT
                      </span>
                    )}
                  </div>
                </div>

                <div className="row g-4 align-items-center">
                  {/* Poster Thumbnail */}
                  <div className="col-sm-3 col-md-2 text-center text-sm-start">
                    <img
                      src={b.movie?.posterUrl}
                      alt={b.movie?.title}
                      className="rounded-3 shadow w-100"
                      style={{ maxHeight: '140px', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Details */}
                  <div className="col-sm-9 col-md-6">
                    <h5 className="text-white fw-bold mb-1">{b.movie?.title}</h5>
                    <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                      <MapPin size={14} className="text-primary" />
                      <span>{b.theatre?.name} ({b.theatre?.city})</span>
                    </p>

                    <div className="d-flex flex-wrap gap-3 small text-secondary mb-2">
                      <span className="d-flex align-items-center gap-1 text-light">
                        <Calendar size={14} /> {formatDate(b.showtime?.date)}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1 text-light">
                        <Clock size={14} /> {formatTime(b.showtime?.startTime)}
                      </span>
                      <span>•</span>
                      <span className="badge bg-primary bg-opacity-25 text-primary">
                        {b.screen?.name || 'Screen 1'}
                      </span>
                    </div>

                    <div className="text-secondary small">
                      <span>Seats ({b.ticketQuantity}): </span>
                      <strong className="text-white">
                        {b.seats?.map((s) => s.seatIdentifier).join(', ')}
                      </strong>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="col-md-4 text-md-end d-flex flex-column justify-content-between">
                    <div className="mb-3">
                      <span className="text-muted small d-block">Total Paid</span>
                      <strong className="text-primary fs-4">{formatCurrency(b.totalAmount)}</strong>
                    </div>

                    <div className="d-flex justify-content-md-end gap-2">
                      <Link
                        to={`/bookings/${b._id}`}
                        className="btn btn-cinema-secondary btn-sm py-2 px-3 d-inline-flex align-items-center gap-1"
                      >
                        <Eye size={14} />
                        <span>View Ticket</span>
                      </Link>

                      {canCancel && (
                        <button
                          onClick={() => setSelectedBookingForCancel(b)}
                          className="btn btn-cinema-danger btn-sm py-2 px-3 d-inline-flex align-items-center gap-1"
                        >
                          <XCircle size={14} />
                          <span>Cancel Ticket</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedBookingForCancel && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
                  <AlertTriangle size={20} className="text-warning" />
                  Confirm Ticket Cancellation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedBookingForCancel(null)}
                ></button>
              </div>

              <div className="modal-body text-secondary small">
                <p className="text-white mb-2">
                  Are you sure you want to cancel booking{' '}
                  <strong className="text-primary">
                    {selectedBookingForCancel.bookingReference}
                  </strong>{' '}
                  for <strong>{selectedBookingForCancel.movie?.title}</strong>?
                </p>
                <div className="p-3 rounded bg-secondary bg-opacity-10 mb-3 border border-secondary border-opacity-25">
                  <span className="text-warning fw-semibold d-block mb-1">Cancellation Policy:</span>
                  Cancellations are accepted up to 2 hours before showtime. The booked seats will immediately be returned to available inventory.
                </div>

                <label className="form-label text-secondary small">Cancellation Reason</label>
                <select
                  className="form-select cinema-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Change of personal schedule">Change of personal schedule</option>
                  <option value="Booked incorrect showtime or seats">Booked incorrect showtime or seats</option>
                  <option value="Emergency or conflict">Emergency or conflict</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-cinema-secondary"
                  onClick={() => setSelectedBookingForCancel(null)}
                >
                  Keep Tickets
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  className="btn btn-cinema-danger"
                  onClick={handleCancelSubmit}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;

