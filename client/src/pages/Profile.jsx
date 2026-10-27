import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import AlertBanner from '../components/common/AlertBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { User, Mail, Phone, Shield, Calendar, Edit3, Ticket, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await bookingService.getMyBookings();
        setBookingCount(res.bookings?.length || 0);
      } catch (err) {
        console.warn('Could not fetch user booking stats:', err.message);
      }
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await updateProfile({ name, phone });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Account Information</span>
          <h2 className="text-white fw-bold mb-0">User Profile</h2>
        </div>
      </div>

      <AlertBanner type="success" message={message} onClose={() => setMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-7">
          <div className="cinema-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-circle bg-primary bg-opacity-20 text-primary">
                  <User size={32} />
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-0">{user?.name}</h4>
                  <span className="badge bg-secondary text-light small text-uppercase">
                    {user?.role} Account
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate}>
                <div className="mb-3">
                  <label className="form-label small text-secondary">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control cinema-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-secondary">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control cinema-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small text-secondary">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    className="form-control cinema-input opacity-50"
                    value={user?.email}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-cinema-primary py-2 px-4"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name);
                      setPhone(user?.phone);
                    }}
                    className="btn btn-cinema-secondary py-2 px-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="row g-4 small">
                <div className="col-md-6">
                  <span className="text-secondary d-flex align-items-center gap-2 mb-1">
                    <Mail size={14} className="text-primary" /> Email Address
                  </span>
                  <strong className="text-white fs-6">{user?.email}</strong>
                </div>

                <div className="col-md-6">
                  <span className="text-secondary d-flex align-items-center gap-2 mb-1">
                    <Phone size={14} className="text-primary" /> Phone Number
                  </span>
                  <strong className="text-white fs-6">{user?.phone || 'Not configured'}</strong>
                </div>

                <div className="col-md-6">
                  <span className="text-secondary d-flex align-items-center gap-2 mb-1">
                    <Shield size={14} className="text-primary" /> Account Role
                  </span>
                  <span className="badge bg-primary fs-6">{user?.role?.toUpperCase()}</span>
                </div>

                <div className="col-md-6">
                  <span className="text-secondary d-flex align-items-center gap-2 mb-1">
                    <Calendar size={14} className="text-primary" /> Member Since
                  </span>
                  <strong className="text-white fs-6">
                    {user?.createdAt ? formatDate(user.createdAt) : '2026'}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Summary */}
        <div className="col-lg-5">
          <div className="cinema-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              Cinema Activity
            </h5>

            <div className="p-3 rounded-3 bg-secondary bg-opacity-10 mb-3 d-flex align-items-center gap-3">
              <div className="p-2 rounded bg-primary bg-opacity-20 text-primary">
                <Ticket size={24} />
              </div>
              <div>
                <h4 className="text-white fw-bold mb-0">{bookingCount}</h4>
                <span className="text-secondary small">Total Cinema Bookings</span>
              </div>
            </div>

            <div className="p-3 rounded-3 bg-secondary bg-opacity-10 d-flex align-items-center gap-3">
              <div className="p-2 rounded bg-success bg-opacity-20 text-success">
                <CheckCircle size={24} />
              </div>
              <div>
                <h5 className="text-white fw-bold mb-0">Active Account</h5>
                <span className="text-secondary small">Instant Demo E-Tickets Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

