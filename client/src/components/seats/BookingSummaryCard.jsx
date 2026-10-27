import React from 'react';
import { Film, MapPin, Calendar, Clock, Ticket, ArrowRight, X } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const BookingSummaryCard = ({
  showtime,
  selectedSeats = [],
  onRemoveSeat,
  onProceedCheckout,
  loading = false
}) => {
  if (!showtime) return null;

  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = selectedSeats.length * 1.50;
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + convenienceFee + tax;

  return (
    <div className="cinema-card p-4">
      <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2 border-bottom border-secondary border-opacity-25 pb-3">
        <Ticket size={20} className="text-primary" />
        <span>Booking Summary</span>
      </h5>

      {/* Movie & Show Info */}
      <div className="mb-3">
        <h6 className="text-white fw-bold mb-1">{showtime.movie?.title}</h6>
        <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
          <MapPin size={14} className="text-primary" />
          <span>{showtime.theatre?.name} ({showtime.theatre?.city})</span>
        </div>
        <div className="d-flex align-items-center gap-3 text-secondary small">
          <span className="d-flex align-items-center gap-1">
            <Calendar size={14} />
            {formatDate(showtime.date)}
          </span>
          <span className="d-flex align-items-center gap-1">
            <Clock size={14} />
            {formatTime(showtime.startTime)}
          </span>
        </div>
      </div>

      {/* Selected Seats Pills */}
      <div className="py-3 border-top border-bottom border-secondary border-opacity-25 my-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-secondary small fw-medium">Selected Seats ({selectedSeats.length})</span>
          {selectedSeats.length > 0 && (
            <span className="badge bg-primary text-white">
              {selectedSeats.length} {selectedSeats.length === 1 ? 'ticket' : 'tickets'}
            </span>
          )}
        </div>

        {selectedSeats.length === 0 ? (
          <p className="text-muted small mb-0 fst-italic">
            Please click on the seating chart to choose your seats.
          </p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat.seatIdentifier}
                className="badge bg-secondary bg-opacity-50 text-light border border-secondary border-opacity-50 d-flex align-items-center gap-1 px-2 py-1"
              >
                <span>{seat.seatIdentifier}</span>
                <span className="text-primary small">({formatCurrency(seat.price)})</span>
                {onRemoveSeat && (
                  <button
                    onClick={() => onRemoveSeat(seat)}
                    className="btn btn-link p-0 text-secondary hover-text-white ms-1"
                    style={{ lineHeight: 1 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      {selectedSeats.length > 0 && (
        <div className="d-flex flex-column gap-2 small mb-4">
          <div className="d-flex justify-content-between text-secondary">
            <span>Ticket Subtotal</span>
            <span className="text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between text-secondary">
            <span>Convenience Fee ($1.50/ticket)</span>
            <span className="text-white">{formatCurrency(convenienceFee)}</span>
          </div>
          <div className="d-flex justify-content-between text-secondary">
            <span>Cinema Tax (5%)</span>
            <span className="text-white">{formatCurrency(tax)}</span>
          </div>
          <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-2 text-white fw-bold fs-6">
            <span>Total Payable</span>
            <span className="text-primary fs-5">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onProceedCheckout}
        disabled={selectedSeats.length === 0 || loading}
        className="btn btn-cinema-primary w-100 justify-content-center py-2"
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm me-2"></span>
        ) : (
          <>
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
};

export default BookingSummaryCard;

