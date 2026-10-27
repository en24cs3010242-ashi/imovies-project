import api from './api';

export const theatreService = {
  async getTheatres(params = {}) {
    const res = await api.get('/theatres', { params });
    return res.data;
  },

  async getTheatreById(id) {
    const res = await api.get(`/theatres/${id}`);
    return res.data;
  },

  async createTheatre(theatreData) {
    const res = await api.post('/theatres', theatreData);
    return res.data;
  },

  async updateTheatre(id, theatreData) {
    const res = await api.put(`/theatres/${id}`, theatreData);
    return res.data;
  },

  async deleteTheatre(id) {
    const res = await api.delete(`/theatres/${id}`);
    return res.data;
  },

  async createScreen(theatreId, screenData) {
    const res = await api.post(`/theatres/${theatreId}/screens`, screenData);
    return res.data;
  }
};

