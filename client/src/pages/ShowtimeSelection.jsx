import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { showtimeService } from '../services/showtimeService';
import { theatreService } from '../services/theatreService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import { Calendar, Clock, MapPin, Film, Ticket } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';

const ShowtimeSelection = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movie');

  const [showtimes, setShowtimes] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [showtimeRes, theatreRes] = await Promise.all([
          showtimeService.getShowtimes({ movieId }),
          theatreService.getTheatres()
        ]);

        setShowtimes(showtimeRes.showtimes || []);
        setTheatres(theatreRes.theatres || []);

        if (showtimeRes.showtimes?.length > 0) {
          setSelectedDate(showtimeRes.showtimes[0].date);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId]);

  if (loading) {
    return <LoadingSpinner text="Loading schedules and cinema auditoriums..." />;
  }

  // Filter showtimes
  const filteredShowtimes = showtimes.filter((s) => {
    if (selectedDate && s.date !== selectedDate) return false;
    if (selectedCity !== 'All' && s.theatre?.city !== selectedCity) return false;
    return true;
  });

  const cities = ['All', ...new Set(theatres.map((t) => t.city))];
  const dates = [...new Set(showtimes.map((s) => s.date))].sort();

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <span className="text-primary text-uppercase fw-semibold small">Schedules</span>
          <h2 className="text-white fw-bold mb-0">Select Showtime & Theatre</h2>
        </div>
      </div>

      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* City and Date Filters */}
      <div className="cinema-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-secondary">Filter by City</label>
            <select
              className="form-select cinema-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small text-secondary">Select Date</label>
            <select
              className="form-select cinema-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Showtimes List */}
      {filteredShowtimes.length === 0 ? (
        <div className="cinema-card p-5 text-center text-secondary">
          No showtimes matching your selection. Try another date or city.
        </div>
      ) : (
        <div className="row g-4">
          {filteredShowtimes.map((st) => (
            <div key={st._id} className="col-md-6 col-lg-4">
              <div className="cinema-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary px-2 py-1">{st.screen?.name || 'Screen 1'}</span>
                    <span className="text-warning small fw-bold">From {formatCurrency(st.price?.standard)}</span>
                  </div>
                  <h5 className="text-white fw-bold mb-2">{st.movie?.title}</h5>
                  <p className="text-secondary small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-primary" />
                    <span>{st.theatre?.name} ({st.theatre?.city})</span>
                  </p>
                  <p className="text-secondary small mb-3 d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center gap-1">
                      <Calendar size={14} /> {formatDate(st.date)}
                    </span>
                    <span className="d-flex align-items-center gap-1 text-light fw-bold">
                      <Clock size={14} /> {formatTime(st.startTime)}
                    </span>
                  </p>
                </div>

                <Link
                  to={`/showtimes/${st._id}/seats`}
                  className="btn btn-cinema-primary w-100 justify-content-center py-2"
                >
                  <Ticket size={16} />
                  <span>Choose Seats</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowtimeSelection;

