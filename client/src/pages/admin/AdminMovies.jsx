import React, { useState, useEffect } from 'react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import FallbackImage from '../../components/common/FallbackImage';
import {
  Film,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Star,
  Clock,
  Calendar,
  X
} from 'lucide-react';
import { formatDuration, formatDate } from '../../utils/formatters';

const initialMovieForm = {
  title: '',
  description: '',
  genre: 'Action, Sci-Fi',
  language: 'English',
  duration: 120,
  rating: 8.0,
  releaseDate: new Date().toISOString().split('T')[0],
  posterUrl: '',
  bannerUrl: '',
  director: '',
  cast: '',
  status: 'Now Showing',
  featured: false
};

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [formData, setFormData] = useState(initialMovieForm);
  const [saving, setSaving] = useState(false);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieService.getMovies({ limit: 100 });
      setMovies(res.movies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentMovieId(null);
    setFormData(initialMovieForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (m) => {
    setIsEditing(true);
    setCurrentMovieId(m._id);
    setFormData({
      title: m.title || '',
      description: m.description || '',
      genre: m.genre?.join(', ') || '',
      language: m.language?.join(', ') || '',
      duration: m.duration || 120,
      rating: m.rating || 7.5,
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '',
      posterUrl: m.posterUrl || '',
      bannerUrl: m.bannerUrl || '',
      director: m.director || '',
      cast: m.cast?.join(', ') || '',
      status: m.status || 'Now Showing',
      featured: !!m.featured
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Parse comma-separated fields
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        rating: Number(formData.rating),
        genre: formData.genre.split(',').map((s) => s.trim()).filter(Boolean),
        language: formData.language.split(',').map((s) => s.trim()).filter(Boolean),
        cast: formData.cast ? formData.cast.split(',').map((s) => s.trim()).filter(Boolean) : []
      };

      if (isEditing) {
        await movieService.updateMovie(currentMovieId, payload);
        setSuccessMessage(`Movie "${formData.title}" updated successfully.`);
      } else {
        await movieService.createMovie(payload);
        setSuccessMessage(`Movie "${formData.title}" created successfully.`);
      }

      setShowModal(false);
      await fetchMovies();
    } catch (err) {
      setError(err.message || 'Failed to save movie details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Are you sure you want to delete "${movie.title}"? Associated showtimes will be deactivated.`)) {
      return;
    }

    try {
      setError(null);
      await movieService.deleteMovie(movie._id);
      setSuccessMessage(`Movie "${movie.title}" deleted.`);
      await fetchMovies();
    } catch (err) {
      setError(err.message || 'Failed to delete movie.');
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Catalog Administration</span>
          <h2 className="text-white fw-bold mb-0">Movie Management</h2>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-cinema-primary">
          <PlusCircle size={16} /> Add New Movie
        </button>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Search Bar */}
      <div className="cinema-card p-3 mb-4">
        <div className="position-relative">
          <input
            type="text"
            className="form-control cinema-input ps-5"
            placeholder="Search movie catalog by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
        </div>
      </div>

      {/* Movies Table */}
      {loading ? (
        <LoadingSpinner text="Loading movie inventory..." />
      ) : (
        <div className="cinema-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25">
                  <th>Poster</th>
                  <th>Movie Title</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((m) => (
                  <tr key={m._id} className="border-secondary border-opacity-10">
                    <td style={{ width: '60px' }}>
                      <FallbackImage
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded"
                        style={{ width: '45px', height: '65px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-white fs-6">{m.title}</div>
                      <span className="text-muted small">Release: {formatDate(m.releaseDate)}</span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {m.genre?.slice(0, 2).map((g, i) => (
                          <span key={i} className="badge bg-secondary small">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td>{m.language?.join(', ')}</td>
                    <td>{formatDuration(m.duration)}</td>
                    <td>
                      <span className="badge bg-warning text-dark fw-bold d-inline-flex align-items-center gap-1">
                        <Star size={11} className="fill-dark" />
                        {m.rating ? m.rating.toFixed(1) : '0.0'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.status === 'Now Showing' ? 'bg-primary' : 'bg-secondary'
                        }`}
                      >
                        {m.status}
                      </span>
                      {m.featured && <span className="badge bg-warning text-dark ms-1">Featured</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="btn btn-sm btn-cinema-secondary p-2"
                          title="Edit Movie"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="btn btn-sm btn-cinema-danger p-2"
                          title="Delete Movie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold d-flex align-items-center gap-2">
                  <Film size={20} className="text-primary" />
                  <span>{isEditing ? 'Edit Movie Details' : 'Add New Movie to Cinema'}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body text-secondary small">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label text-secondary small">Movie Title *</label>
                      <input
                        type="text"
                        required
                        className="form-control cinema-input"
                        placeholder="e.g. Gladiator II"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary small">Status *</label>
                      <select
                        className="form-select cinema-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Now Showing">Now Showing</option>
                        <option value="Coming Soon">Coming Soon</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-secondary small">Description *</label>
                      <textarea
                        required
                        rows="3"
                        className="form-control cinema-input"
                        placeholder="Synopsis and storyline..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Genres (comma separated) *</label>
                      <input
                        type="text"
                        required
                        className="form-control cinema-input"
                        placeholder="Action, Sci-Fi, Adventure"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Languages (comma separated) *</label>
                      <input
                        type="text"
                        required
                        className="form-control cinema-input"
                        placeholder="English, Spanish"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary small">Duration (minutes) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="form-control cinema-input"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary small">Rating (0 - 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control cinema-input"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary small">Release Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control cinema-input"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Poster Image URL *</label>
                      <input
                        type="url"
                        required
                        className="form-control cinema-input"
                        placeholder="https://..."
                        value={formData.posterUrl}
                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Banner Image URL</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        placeholder="https://..."
                        value={formData.bannerUrl}
                        onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Director</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        placeholder="e.g. Christopher Nolan"
                        value={formData.director}
                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Starring Cast (comma separated)</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        placeholder="Actor 1, Actor 2..."
                        value={formData.cast}
                        onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featuredCheck"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <label className="form-check-label text-white small" htmlFor="featuredCheck">
                          Feature this movie on the Home hero banner
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button
                    type="button"
                    className="btn btn-cinema-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-cinema-primary">
                    {saving ? 'Saving Movie...' : isEditing ? 'Save Changes' : 'Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;

