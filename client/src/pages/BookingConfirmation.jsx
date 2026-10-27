import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import {
  CheckCircle,
  Ticket,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Film,
  Download,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        navigate('/movies');
        return;
      }
      try {
        setLoading(true);
        const res = await bookingService.getBookingById(bookingId);
        setBooking(res.booking);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Generating digital ticket..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <AlertBanner type="danger" message={error || 'Booking details not found.'} />
        <Link to="/movies" className="btn btn-cinema-primary">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Success Notification */}
      <div className="text-center mb-5">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-15 text-success mb-3 shadow">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small mb-0">
          Your cinema tickets are booked and ready. An electronic confirmation has been generated.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          {/* Cinema Ticket Card */}
          <div className="cinema-ticket p-4 p-md-5 mb-4 position-relative">
            {/* Ticket Notches */}
            <div className="ticket-notch-left"></div>
            <div className="ticket-notch-right"></div>

            {/* Top Ticket Header */}
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-2">
                <Film size={22} className="text-primary" />
                <span className="brand-logo fs-5">IMOVIES PASS</span>
              </div>
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-3 py-1">
                CONFIRMED
              </span>
            </div>

            {/* Movie Info */}
            <div className="row g-4 align-items-center my-2">
              <div className="col-sm-4 text-center text-sm-start">
                <img
                  src={booking.movie?.posterUrl}
                  alt={booking.movie?.title}
                  className="rounded-3 shadow w-100"
                  style={{ maxHeight: '180px', objectFit: 'cover' }}
                />
              </div>

              <div className="col-sm-8">
                <h4 className="text-white fw-bold mb-2">{booking.movie?.title}</h4>
                <p className="text-secondary small mb-3">
                  <MapPin size={14} className="text-primary me-1" />
                  {booking.theatre?.name} ({booking.theatre?.city})
                </p>

                <div className="row g-2 small text-secondary">
                  <div className="col-6">
                    <span className="text-muted d-block">Screen</span>
                    <strong className="text-white">{booking.screen?.name || 'Screen 1'}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Quantity</span>
                    <strong className="text-white">{booking.ticketQuantity} Tickets</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Show Date</span>
                    <strong className="text-white">{formatDate(booking.showtime?.date)}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Time</span>
                    <strong className="text-white">{formatTime(booking.showtime?.startTime)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforation Divider */}
            <div className="ticket-perforation"></div>

            {/* Bottom Section: Seats & QR Mockup */}
            <div className="row align-items-center g-3">
              <div className="col-sm-8">
                <div className="mb-2">
                  <span className="text-muted small d-block">Confirmed Seats</span>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {booking.seats?.map((s) => (
                      <span key={s.seatIdentifier} className="badge bg-primary px-3 py-2 fs-6">
                        {s.seatIdentifier} ({s.tier})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="d-flex gap-4 small text-secondary mt-3">
                  <div>
                    <span className="text-muted d-block">Booking Reference</span>
                    <strong className="text-white font-monospace">{booking.bookingReference}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block">Amount Paid</span>
                    <strong className="text-white">{formatCurrency(booking.totalAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Barcode Mockup */}
              <div className="col-sm-4 text-center">
                <div className="bg-white p-2 rounded shadow-sm d-inline-block">
                  {/* SVG Barcode Graphic */}
                  <svg width="100" height="40" viewBox="0 0 100 40">
                    <rect x="2" y="5" width="3" height="30" fill="#000" />
                    <rect x="7" y="5" width="2" height="30" fill="#000" />
                    <rect x="12" y="5" width="4" height="30" fill="#000" />
                    <rect x="18" y="5" width="1" height="30" fill="#000" />
                    <rect x="22" y="5" width="5" height="30" fill="#000" />
                    <rect x="30" y="5" width="2" height="30" fill="#000" />
                    <rect x="35" y="5" width="3" height="30" fill="#000" />
                    <rect x="41" y="5" width="4" height="30" fill="#000" />
                    <rect x="48" y="5" width="2" height="30" fill="#000" />
                    <rect x="53" y="5" width="5" height="30" fill="#000" />
                    <rect x="61" y="5" width="2" height="30" fill="#000" />
                    <rect x="66" y="5" width="3" height="30" fill="#000" />
                    <rect x="72" y="5" width="4" height="30" fill="#000" />
                    <rect x="79" y="5" width="2" height="30" fill="#000" />
                    <rect x="84" y="5" width="5" height="30" fill="#000" />
                    <rect x="92" y="5" width="3" height="30" fill="#000" />
                  </svg>
                  <div className="text-dark small font-monospace" style={{ fontSize: '9px' }}>
                    {booking.bookingReference}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <button onClick={handlePrint} className="btn btn-cinema-secondary">
              <Printer size={16} />
              <span>Print / Download Ticket</span>
            </button>
            <Link to="/my-bookings" className="btn btn-cinema-primary">
              <Ticket size={16} />
              <span>View in My Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

