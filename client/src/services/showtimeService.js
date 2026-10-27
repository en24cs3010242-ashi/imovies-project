import api from './api';

export const showtimeService = {
  async getShowtimes(params = {}) {
    const res = await api.get('/showtimes', { params });
    return res.data;
  },

  async getShowtimeById(id) {
    const res = await api.get(`/showtimes/${id}`);
    return res.data;
  },

  async createShowtime(data) {
    const res = await api.post('/showtimes', data);
    return res.data;
  },

  async updateShowtime(id, data) {
    const res = await api.put(`/showtimes/${id}`, data);
    return res.data;
  },

  async deleteShowtime(id) {
    const res = await api.delete(`/showtimes/${id}`);
    return res.data;
  },

  async getShowtimeSeats(showtimeId) {
    const res = await api.get(`/showtimes/${showtimeId}/seats`);
    return res.data;
  },

  async reserveSeats(showtimeId, seatIdentifiers) {
    const res = await api.post(`/showtimes/${showtimeId}/reservations`, {
      seatIdentifiers
    });
    return res.data;
  },

  async releaseSeats(showtimeId, seatIdentifiers) {
    const res = await api.delete(`/showtimes/${showtimeId}/reservations`, {
      data: { seatIdentifiers }
    });
    return res.data;
  }
};

