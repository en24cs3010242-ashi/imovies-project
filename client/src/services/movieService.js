import api from './api';

export const movieService = {
  async getMovies(params = {}) {
    const res = await api.get('/movies', { params });
    return res.data;
  },

  async getMovieById(id) {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  },

  async createMovie(movieData) {
    const res = await api.post('/movies', movieData);
    return res.data;
  },

  async updateMovie(id, movieData) {
    const res = await api.put(`/movies/${id}`, movieData);
    return res.data;
  },

  async deleteMovie(id) {
    const res = await api.delete(`/movies/${id}`);
    return res.data;
  }
};

