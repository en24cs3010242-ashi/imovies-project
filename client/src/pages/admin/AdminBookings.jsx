import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Ticket,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  User,
  CreditCard
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings({
        search: searchTerm || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        page,
        limit: 15
      });
      setBookings(res.bookings || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Transactions & Orders</span>
          <h2 className="text-white fw-bold mb-0">Booking Management</h2>
        </div>
        <div className="text-secondary small">
          Total Recorded Orders: <strong className="text-white">{total}</strong>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Search and Filters */}
      <div className="cinema-card p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-3 align-items-end">
          <div className="col-md-7">
            <label className="form-label small text-secondary">Search by Booking Reference</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control cinema-input ps-5"
                placeholder="e.g. IMV-839210"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
              />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-secondary">Booking Status</label>
            <select
              className="form-select cinema-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="col-md-2">
            <button type="submit" className="btn btn-cinema-primary w-100 py-2">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving booking ledgers..." />
      ) : bookings.length === 0 ? (
        <div className="cinema-card p-5 text-center text-secondary">
          No bookings match the search criteria.
        </div>
      ) : (
        <div className="cinema-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie Title</th>
                  <th>Auditorium</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-secondary border-opacity-10">
                    <td className="font-monospace text-primary fw-bold">{b.bookingReference}</td>
                    <td>
                      <div className="fw-medium text-white">{b.user?.name || 'Guest'}</div>
                      <span className="text-muted small">{b.user?.email}</span>
                    </td>
                    <td className="fw-semibold text-white">{b.movie?.title}</td>
                    <td>
                      <div>{b.theatre?.name}</div>
                      <span className="text-muted small">{b.screen?.name}</span>
                    </td>
                    <td>
                      <div>{formatDate(b.showtime?.date)}</div>
                      <span className="text-primary small">{formatTime(b.showtime?.startTime)}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {b.seats?.map((s) => s.seatIdentifier).join(', ')}
                      </span>
                    </td>
                    <td className="fw-bold text-white">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.paymentStatus === 'Paid'
                            ? 'bg-success bg-opacity-25 text-success'
                            : b.paymentStatus === 'Refunded'
                            ? 'bg-info bg-opacity-25 text-info'
                            : 'bg-warning bg-opacity-25 text-warning'
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-success'
                            : b.bookingStatus === 'Cancelled'
                            ? 'bg-danger'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="btn btn-sm btn-cinema-secondary p-1"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top border-secondary border-opacity-25 small">
              <span className="text-secondary">
                Page {page} of {totalPages}
              </span>
              <div className="d-flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-sm btn-cinema-secondary px-3"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-sm btn-cinema-secondary px-3"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold">
                  Order Details: {selectedBooking.bookingReference}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <div className="modal-body text-secondary small">
                <div className="mb-3">
                  <h6 className="text-white fw-bold mb-1">{selectedBooking.movie?.title}</h6>
                  <p className="mb-1">{selectedBooking.theatre?.name} • {selectedBooking.screen?.name}</p>
                  <p className="text-primary mb-0">
                    {formatDate(selectedBooking.showtime?.date)} at {formatTime(selectedBooking.showtime?.startTime)}
                  </p>
                </div>

                <div className="p-3 rounded bg-secondary bg-opacity-10 mb-3 border border-secondary border-opacity-25">
                  <span className="text-white fw-semibold d-block mb-1">Customer Information:</span>
                  <div>Name: <strong className="text-white">{selectedBooking.user?.name}</strong></div>
                  <div>Email: <strong className="text-white">{selectedBooking.user?.email}</strong></div>
                  <div>Phone: <strong className="text-white">{selectedBooking.user?.phone || 'N/A'}</strong></div>
                </div>

                <div className="mb-3">
                  <span className="text-white fw-semibold d-block mb-1">Allocated Seats:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedBooking.seats?.map((s) => (
                      <span key={s.seatIdentifier} className="badge bg-primary px-2 py-1">
                        Seat {s.seatIdentifier} ({s.tier} - {formatCurrency(s.price)})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-top border-secondary border-opacity-25 pt-2">
                  <div className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span className="text-white">{formatCurrency(selectedBooking.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Fee:</span>
                    <span className="text-white">{formatCurrency(selectedBooking.convenienceFee)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Tax:</span>
                    <span className="text-white">{formatCurrency(selectedBooking.tax)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold text-white fs-6 pt-1 border-top border-secondary border-opacity-25">
                    <span>Total Paid:</span>
                    <span className="text-primary">{formatCurrency(selectedBooking.totalAmount)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button type="button" className="btn btn-cinema-secondary" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

