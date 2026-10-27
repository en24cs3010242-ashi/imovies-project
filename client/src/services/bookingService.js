import api from './api';

export const bookingService = {
  async createBooking(showtimeId, seatIdentifiers) {
    const res = await api.post('/bookings', {
      showtimeId,
      seatIdentifiers
    });
    return res.data;
  },

  async getMyBookings() {
    const res = await api.get('/bookings/my');
    return res.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id, reason) {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason });
    return res.data;
  }
};

