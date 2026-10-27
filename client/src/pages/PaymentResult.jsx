import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Film,
  Building,
  Smartphone
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'Success' | 'Failed' | 'Cancelled'
  const [error, setError] = useState(null);

  // Demo payment method
  const [paymentMethod, setPaymentMethod] = useState('Demo Card');

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

        if (res.booking.paymentStatus === 'Paid') {
          navigate(`/confirmation?bookingId=${res.booking._id}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleSimulatePayment = async (action) => {
    try {
      setProcessing(true);
      setError(null);

      const res = await paymentService.processDemoPayment(bookingId, action, paymentMethod);

      if (action === 'success') {
        navigate(`/confirmation?bookingId=${booking._id}`);
      } else if (action === 'failed') {
        setPaymentStatus('Failed');
        setError('Payment simulation: The test issuing bank declined this transaction.');
      } else if (action === 'cancel') {
        setPaymentStatus('Cancelled');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while processing demo payment.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to demo payment gateway..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <AlertBanner type="danger" message={error || 'Booking session not found.'} />
        <Link to="/movies" className="btn btn-cinema-primary">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Gateway Safety Banner */}
      <div className="alert bg-primary bg-opacity-10 border border-primary border-opacity-25 p-3 rounded-4 mb-4 text-center">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
          <ShieldCheck size={20} className="text-primary" />
          <strong className="text-white">DEMO PAYMENT GATEWAY (ACADEMIC SIMULATION)</strong>
        </div>
        <p className="text-secondary small mb-0">
          This simulated gateway demonstrates secure e-commerce payment workflows. No real credit card or bank details are accepted or stored.
        </p>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Payment Cancelled State */}
      {paymentStatus === 'Cancelled' ? (
        <div className="cinema-card p-5 text-center my-4">
          <XCircle size={56} className="text-warning mb-3" />
          <h3 className="text-white fw-bold mb-2">Payment Cancelled</h3>
          <p className="text-secondary small col-md-6 mx-auto mb-4">
            You aborted the demo payment process. Your reserved seats for <strong>{booking.movie?.title}</strong> have been released back to the general audience.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/movies" className="btn btn-cinema-primary">
              Browse Movies
            </Link>
            <Link to="/my-bookings" className="btn btn-cinema-secondary">
              View My Bookings
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left: Payment Form Mockup */}
          <div className="col-lg-7">
            <div className="cinema-card p-4">
              <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                Select Demo Payment Method
              </h5>

              {/* Method Selector Tabs */}
              <div className="d-flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Demo Card')}
                  className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 small ${
                    paymentMethod === 'Demo Card' ? 'btn-cinema-primary' : 'btn-cinema-secondary'
                  }`}
                >
                  <CreditCard size={16} /> Demo Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Demo UPI')}
                  className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 small ${
                    paymentMethod === 'Demo UPI' ? 'btn-cinema-primary' : 'btn-cinema-secondary'
                  }`}
                >
                  <Smartphone size={16} /> Demo UPI / Instant
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Demo NetBanking')}
                  className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 small ${
                    paymentMethod === 'Demo NetBanking' ? 'btn-cinema-primary' : 'btn-cinema-secondary'
                  }`}
                >
                  <Building size={16} /> Net Banking
                </button>
              </div>

              {/* Mockup Card Fields */}
              {paymentMethod === 'Demo Card' && (
                <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small text-secondary">Cardholder Name (Demo)</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        disabled
                        value="Alex Johnson (Demo Account)"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-secondary">Demo Card Number</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        disabled
                        value="4000 1234 5678 9010 (Visa Sandbox)"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Expiry</label>
                      <input type="text" className="form-control cinema-input" disabled value="12/28" />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">CVV</label>
                      <input type="text" className="form-control cinema-input" disabled value="•••" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Demo UPI' && (
                <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4 text-center">
                  <p className="text-secondary small mb-2">Simulated Virtual Payment Address (VPA)</p>
                  <strong className="text-white fs-6">user@demobank.upi</strong>
                </div>
              )}

              {paymentMethod === 'Demo NetBanking' && (
                <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4 text-center">
                  <p className="text-secondary small mb-2">Simulated Bank Partner</p>
                  <strong className="text-white fs-6">Global Reserve Demo Cinema Bank</strong>
                </div>
              )}

              {/* Simulation Action Triggers */}
              <h6 className="text-white fw-bold mb-3">Trigger Simulation Outcome:</h6>
              <div className="d-flex flex-column gap-2">
                <button
                  onClick={() => handleSimulatePayment('success')}
                  disabled={processing}
                  className="btn btn-success py-2 d-flex align-items-center justify-content-center gap-2 fw-semibold"
                >
                  {processing ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Simulate Successful Payment ({formatCurrency(booking.totalAmount)})</span>
                    </>
                  )}
                </button>

                <div className="d-flex gap-2">
                  <button
                    onClick={() => handleSimulatePayment('failed')}
                    disabled={processing}
                    className="btn btn-outline-danger flex-fill py-2 d-flex align-items-center justify-content-center gap-2 small"
                  >
                    <AlertTriangle size={16} />
                    <span>Simulate Failed Payment</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePayment('cancel')}
                    disabled={processing}
                    className="btn btn-outline-secondary flex-fill py-2 d-flex align-items-center justify-content-center gap-2 small"
                  >
                    <XCircle size={16} />
                    <span>Cancel Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-lg-5">
            <div className="cinema-card p-4">
              <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                Order Review
              </h5>

              <div className="mb-3">
                <span className="badge bg-secondary mb-1">Booking Ref: {booking.bookingReference}</span>
                <h5 className="text-white fw-bold mb-1">{booking.movie?.title}</h5>
                <p className="text-secondary small mb-2">
                  {booking.theatre?.name} • {booking.screen?.name || 'Screen 1'}
                </p>
                <p className="text-secondary small mb-0">
                  {formatDate(booking.showtime?.date)} at {formatTime(booking.showtime?.startTime)}
                </p>
              </div>

              <div className="border-top border-secondary border-opacity-25 pt-3 mb-3">
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Seats ({booking.ticketQuantity})</span>
                  <span className="text-white">{booking.seats?.map((s) => s.seatIdentifier).join(', ')}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Subtotal</span>
                  <span className="text-white">{formatCurrency(booking.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Convenience Fee</span>
                  <span className="text-white">{formatCurrency(booking.convenienceFee)}</span>
                </div>
                <div className="d-flex justify-content-between text-secondary small mb-1">
                  <span>Taxes</span>
                  <span className="text-white">{formatCurrency(booking.tax)}</span>
                </div>
                <div className="d-flex justify-content-between text-white fw-bold pt-2 border-top border-secondary border-opacity-25 fs-5">
                  <span>Total Due</span>
                  <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;

