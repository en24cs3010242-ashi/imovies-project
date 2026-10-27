import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import { Users, Search, Shield, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers({
        search: searchTerm || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined
      });
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of ${targetUser.name} to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      setError(null);
      await adminService.updateUserStatus(targetUser._id, { role: newRole });
      setSuccessMessage(`User role updated to ${newRole}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = !targetUser.isActive;
    const actionText = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionText} ${targetUser.name}'s account?`)) {
      return;
    }

    try {
      setError(null);
      await adminService.updateUserStatus(targetUser._id, { isActive: newStatus });
      setSuccessMessage(`User account has been ${newStatus ? 'reactivated' : 'deactivated'}.`);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const nameMatch = u.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Access Control & Patron Accounts</span>
          <h2 className="text-white fw-bold mb-0">User Management</h2>
        </div>
        <div className="text-secondary small">
          Total Registered Users: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Search and Filters */}
      <div className="cinema-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control cinema-input ps-5"
                placeholder="Search by patron name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={16}
                className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select cinema-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading user directory..." />
      ) : (
        <div className="cinema-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25">
                  <th>Patron Name</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Bookings</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isSelf = currentAdmin?._id === u._id || currentAdmin?.id === u._id;

                  return (
                    <tr key={u._id} className="border-secondary border-opacity-10">
                      <td>
                        <div className="fw-bold text-white fs-6">{u.name}</div>
                        <span className="text-muted small">Joined {formatDate(u.createdAt)}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 'admin'
                              ? 'bg-warning text-dark fw-bold'
                              : 'bg-secondary'
                          }`}
                        >
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-25 text-primary">
                          {u.bookingCount || 0} orders
                        </span>
                      </td>
                      <td className="fw-semibold text-white">
                        {formatCurrency(u.totalSpent || 0)}
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge bg-success bg-opacity-25 text-success">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-25 text-danger">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="text-muted small fst-italic">Current Session</span>
                        ) : (
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => handleToggleRole(u)}
                              className="btn btn-sm btn-cinema-secondary py-1 px-2 small"
                              title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            >
                              <Shield size={13} className="me-1" />
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`btn btn-sm ${
                                u.isActive ? 'btn-cinema-danger' : 'btn-success'
                              } py-1 px-2 small`}
                            >
                              {u.isActive ? <Ban size={13} /> : <CheckCircle size={13} />}
                              <span className="ms-1">{u.isActive ? 'Disable' : 'Activate'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

