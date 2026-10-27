import React, { useState, useEffect } from 'react';
import { showtimeService } from '../../services/showtimeService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertBanner from '../../components/common/AlertBanner';
import {
  Calendar,
  Clock,
  PlusCircle,
  MapPin,
  Film,
  XCircle,
  Tv
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const AdminShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter state
  const [filterMovie, setFilterMovie] = useState('All');
  const [filterTheatre, setFilterTheatre] = useState('All');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    movie: '',
    theatre: '',
    screen: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:30',
    priceStandard: 13.0,
    pricePremium: 17.0,
    priceVip: 23.0
  });

  const [availableScreens, setAvailableScreens] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showtimeRes, movieRes, theatreRes] = await Promise.all([
        showtimeService.getShowtimes({ status: 'All' }),
        movieService.getMovies({ limit: 100 }),
        theatreService.getTheatres()
      ]);

      setShowtimes(showtimeRes.showtimes || []);
      setMovies(movieRes.movies || []);
      setTheatres(theatreRes.theatres || []);

      if (movieRes.movies?.length > 0 && theatreRes.theatres?.length > 0) {
        const initialTheatre = theatreRes.theatres[0];
        setFormData((prev) => ({
          ...prev,
          movie: movieRes.movies[0]._id,
          theatre: initialTheatre._id,
          screen: initialTheatre.screens?.[0]?._id || ''
        }));
        setAvailableScreens(initialTheatre.screens || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTheatreChange = (theatreId) => {
    const selected = theatres.find((t) => t._id === theatreId);
    const screens = selected?.screens || [];
    setAvailableScreens(screens);
    setFormData({
      ...formData,
      theatre: theatreId,
      screen: screens[0]?._id || ''
    });
  };

  const handleScheduleShowtime = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        movie: formData.movie,
        theatre: formData.theatre,
        screen: formData.screen,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        price: {
          standard: Number(formData.priceStandard),
          premium: Number(formData.pricePremium),
          vip: Number(formData.priceVip)
        },
        status: 'Active'
      };

      await showtimeService.createShowtime(payload);
      setSuccessMessage('Showtime scheduled successfully without conflicts.');
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Conflict detected or scheduling failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelShowtime = async (st) => {
    if (!window.confirm(`Mark showtime on ${formatDate(st.date)} at ${formatTime(st.startTime)} as cancelled?`)) {
      return;
    }
    try {
      setError(null);
      await showtimeService.deleteShowtime(st._id);
      setSuccessMessage('Showtime marked as cancelled.');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to cancel showtime.');
    }
  };

  const filteredShowtimes = showtimes.filter((st) => {
    if (filterMovie !== 'All' && st.movie?._id !== filterMovie) return false;
    if (filterTheatre !== 'All' && st.theatre?._id !== filterTheatre) return false;
    return true;
  });

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Schedules & Screenings</span>
          <h2 className="text-white fw-bold mb-0">Showtime Management</h2>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-cinema-primary">
          <PlusCircle size={16} /> Schedule Showtime
        </button>
      </div>

      <AlertBanner type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Filter Row */}
      <div className="cinema-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-secondary">Filter by Movie</label>
            <select
              className="form-select cinema-select"
              value={filterMovie}
              onChange={(e) => setFilterMovie(e.target.value)}
            >
              <option value="All">All Movies</option>
              {movies.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Filter by Theatre</label>
            <select
              className="form-select cinema-select"
              value={filterTheatre}
              onChange={(e) => setFilterTheatre(e.target.value)}
            >
              <option value="All">All Theatres</option>
              {theatres.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Showtimes Table */}
      {loading ? (
        <LoadingSpinner text="Loading schedules..." />
      ) : (
        <div className="cinema-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle small">
              <thead>
                <tr className="text-secondary border-secondary border-opacity-25">
                  <th>Movie</th>
                  <th>Theatre Complex</th>
                  <th>Auditorium</th>
                  <th>Date & Time</th>
                  <th>Prices (Std / Prem / VIP)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredShowtimes.map((st) => (
                  <tr key={st._id} className="border-secondary border-opacity-10">
                    <td>
                      <div className="fw-bold text-white fs-6">{st.movie?.title}</div>
                      <span className="text-muted small">{st.movie?.duration} mins</span>
                    </td>
                    <td>
                      <div>{st.theatre?.name}</div>
                      <span className="text-secondary small">{st.theatre?.city}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{st.screen?.name || 'Screen 1'}</span>
                    </td>
                    <td>
                      <div className="text-white fw-bold">{formatDate(st.date)}</div>
                      <span className="text-primary small">{formatTime(st.startTime)}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <span className="badge badge-standard">{formatCurrency(st.price?.standard)}</span>
                        <span className="badge badge-premium">{formatCurrency(st.price?.premium)}</span>
                        <span className="badge badge-vip">{formatCurrency(st.price?.vip)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          st.status === 'Active' ? 'bg-success bg-opacity-25 text-success' : 'bg-danger'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td>
                      {st.status === 'Active' && (
                        <button
                          onClick={() => handleCancelShowtime(st)}
                          className="btn btn-sm btn-cinema-danger p-1"
                          title="Cancel Showtime"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Showtime Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-secondary">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title text-white fw-bold">Schedule New Screening</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleScheduleShowtime}>
                <div className="modal-body text-secondary small">
                  <div className="mb-3">
                    <label className="form-label text-secondary small">Select Movie *</label>
                    <select
                      className="form-select cinema-select"
                      value={formData.movie}
                      onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.duration}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Theatre *</label>
                      <select
                        className="form-select cinema-select"
                        value={formData.theatre}
                        onChange={(e) => handleTheatreChange(e.target.value)}
                      >
                        {theatres.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Screen *</label>
                      <select
                        className="form-select cinema-select"
                        value={formData.screen}
                        onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
                      >
                        {availableScreens.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.seatingCapacity} seats)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control cinema-input"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-secondary small">Start Time *</label>
                      <input
                        type="time"
                        required
                        className="form-control cinema-input"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-4">
                      <label className="form-label text-secondary small">Standard ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="form-control cinema-input"
                        value={formData.priceStandard}
                        onChange={(e) => setFormData({ ...formData, priceStandard: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-secondary small">Premium ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="form-control cinema-input"
                        value={formData.pricePremium}
                        onChange={(e) => setFormData({ ...formData, pricePremium: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-secondary small">VIP ($)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="form-control cinema-input"
                        value={formData.priceVip}
                        onChange={(e) => setFormData({ ...formData, priceVip: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-cinema-primary">
                    {saving ? 'Checking Conflicts & Saving...' : 'Schedule Showtime'}
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

export default AdminShowtimes;

