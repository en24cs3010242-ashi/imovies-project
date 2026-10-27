import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Users,
  Film,
  Building,
  Calendar,
  Ticket,
  DollarSign,
  PlusCircle,
  Eye,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        setStats(res.stats);
        setRecentBookings(res.recentBookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling administrative analytics..." />;
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Operations & Analytics</span>
          <h2 className="text-white fw-bold mb-0">Admin Dashboard</h2>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/movies" className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1">
            <PlusCircle size={15} /> Add Movie
          </Link>
          <Link to="/admin/showtimes" className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1">
            <Calendar size={15} /> Schedule Show
          </Link>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* 6 Key Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users size={20} />}
            subtitle="Registered patrons"
            color="primary"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Movies Catalog"
            value={stats?.totalMovies || 0}
            icon={<Film size={20} />}
            subtitle="Titles in database"
            color="info"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Theatres"
            value={stats?.totalTheatres || 0}
            icon={<Building size={20} />}
            subtitle="Active complexes"
            color="warning"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Active Shows"
            value={stats?.totalShowtimes || 0}
            icon={<Calendar size={20} />}
            subtitle="Scheduled slots"
            color="success"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={<Ticket size={20} />}
            subtitle="Orders created"
            color="primary"
          />
        </div>
        <div className="col-xl-2 col-md-4 col-6">
          <AdminStatCard
            title="Demo Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<DollarSign size={20} />}
            subtitle="Simulated payments"
            color="success"
          />
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="cinema-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white fw-bold mb-0">Recent Cinema Bookings</h5>
          <Link to="/admin/bookings" className="btn btn-sm btn-cinema-secondary">
            View All ({stats?.totalBookings})
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-secondary small mb-0">No bookings recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25">
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Showtime</th>
                  <th>Tickets</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b._id} className="border-secondary border-opacity-10">
                    <td className="font-monospace text-primary fw-semibold">{b.bookingReference}</td>
                    <td>{b.user?.name || 'Guest User'}</td>
                    <td className="fw-medium text-white">{b.movie?.title}</td>
                    <td>{b.theatre?.name}</td>
                    <td>{formatDate(b.showtime?.date)} {formatTime(b.showtime?.startTime)}</td>
                    <td>{b.ticketQuantity} Seats</td>
                    <td className="fw-bold text-white">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span
                        className={`badge px-2 py-1 ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-success bg-opacity-25 text-success'
                            : b.bookingStatus === 'Cancelled'
                            ? 'bg-danger bg-opacity-25 text-danger'
                            : 'bg-warning bg-opacity-25 text-warning'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/bookings/${b._id}`} className="btn btn-sm btn-cinema-secondary p-1">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

