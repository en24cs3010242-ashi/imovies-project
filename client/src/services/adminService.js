import api from './api';

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getAllBookings(params = {}) {
    const res = await api.get('/admin/bookings', { params });
    return res.data;
  },

  async getAllUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id, data) {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  }
};

