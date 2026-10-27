import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { movieService } from '../services/movieService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import FallbackImage from '../components/common/FallbackImage';
import {
  Star,
  Clock,
  Calendar,
  MapPin,
  Film,
  Ticket,
  ChevronRight,
  User
} from 'lucide-react';
import { formatDuration, formatDate, formatTime, formatCurrency } from '../utils/formatters';

const MovieDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const res = await movieService.getMovieById(id);
        setMovie(res.movie);
        setShowtimes(res.showtimes || []);

        // Extract unique dates from showtimes
        const dates = [...new Set((res.showtimes || []).map((s) => s.date))].sort();
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading cinematic details..." />;
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <AlertBanner type="danger" message={error || 'Movie could not be loaded.'} />
        <Link to="/movies" className="btn btn-cinema-primary">
          Back to Movies
        </Link>
      </div>
    );
  }

  // Filter showtimes for currently selected date and group by theatre
  const currentShowtimes = showtimes.filter((s) => s.date === selectedDate);
  const showtimesByTheatre = {};
  currentShowtimes.forEach((st) => {
    const theatreId = st.theatre?._id || 'unknown';
    if (!showtimesByTheatre[theatreId]) {
      showtimesByTheatre[theatreId] = {
        theatre: st.theatre,
        items: []
      };
    }
    showtimesByTheatre[theatreId].items.push(st);
  });

  return (
    <div>
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Cinematic Banner Header */}
      <div className="position-relative overflow-hidden mb-5" style={{ minHeight: '400px', background: '#0a1020' }}>
        <div
          className="position-absolute inset-0 w-100 h-100"
          style={{
            backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3)'
          }}
        ></div>
        <div
          className="position-absolute inset-0 w-100 h-100"
          style={{
            background: 'linear-gradient(0deg, #070b19 0%, rgba(7, 11, 25, 0.75) 60%, transparent 100%)'
          }}
        ></div>

        <div className="container position-relative z-1 py-5">
          <div className="row g-4 align-items-center">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div className="poster-container rounded-4 shadow-lg border border-secondary border-opacity-50 mx-auto mx-md-0" style={{ maxWidth: '280px' }}>
                <FallbackImage
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="poster-image"
                />
              </div>
            </div>

            {/* Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-primary px-3 py-1 text-uppercase">{movie.status}</span>
                <span className="badge bg-dark border border-secondary text-light">
                  {movie.language?.join(' • ')}
                </span>
                <span className="badge bg-warning text-dark fw-bold d-flex align-items-center gap-1">
                  <Star size={13} className="fill-dark" />
                  {movie.rating ? `${movie.rating.toFixed(1)} / 10` : 'Not Rated'}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-4">
                <span className="d-flex align-items-center gap-1 text-light">
                  <Clock size={15} />
                  {formatDuration(movie.duration)}
                </span>
                <span>•</span>
                <span className="text-light">{movie.genre?.join(', ')}</span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1 text-light">
                  <Calendar size={15} />
                  Released: {formatDate(movie.releaseDate)}
                </span>
              </div>

              <div className="mb-4">
                <h6 className="text-white text-uppercase small fw-bold">Overview</h6>
                <p className="text-secondary lead fs-6 mb-0 col-lg-10">
                  {movie.description}
                </p>
              </div>

              {/* Cast & Director */}
              <div className="d-flex flex-wrap gap-4 text-secondary small pt-3 border-top border-secondary border-opacity-25">
                {movie.director && (
                  <div>
                    <span className="text-muted d-block small">Director</span>
                    <strong className="text-white">{movie.director}</strong>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <span className="text-muted d-block small">Starring Cast</span>
                    <strong className="text-white">{movie.cast.join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showtime Booking Section */}
      <div className="container pb-5" id="showtimes-section">
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <span className="text-primary text-uppercase fw-semibold small">Choose Experience</span>
            <h3 className="text-white fw-bold mb-0">Theatres & Showtimes</h3>
          </div>
        </div>

        {movie.status === 'Coming Soon' ? (
          <div className="cinema-card p-5 text-center my-4">
            <Ticket size={48} className="text-warning mb-3" />
            <h4 className="text-white fw-bold">Tickets Coming Soon</h4>
            <p className="text-secondary small col-md-6 mx-auto mb-0">
              Advance booking for <strong>{movie.title}</strong> will be announced prior to its release date on {formatDate(movie.releaseDate)}.
            </p>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="cinema-card p-5 text-center my-4">
            <Film size={48} className="text-secondary mb-3 opacity-50" />
            <h4 className="text-white fw-bold">No Scheduled Showtimes</h4>
            <p className="text-secondary small mb-0">
              There are currently no active showtimes for this movie in your area. Please check back later.
            </p>
          </div>
        ) : (
          <>
            {/* Date Picker Pills */}
            <div className="d-flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
              {availableDates.map((d) => {
                const isActive = d === selectedDate;
                const dateObj = new Date(d);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`btn text-start p-3 rounded-3 transition-all ${
                      isActive
                        ? 'btn-cinema-primary shadow'
                        : 'btn-cinema-secondary'
                    }`}
                    style={{ minWidth: '110px' }}
                  >
                    <div className="text-uppercase small fw-bold opacity-75">{dayName}</div>
                    <div className="fs-6 fw-extrabold">{monthDay}</div>
                  </button>
                );
              })}
            </div>

            {/* Theatres and Showtimes Grouped List */}
            <div className="d-flex flex-column gap-4">
              {Object.keys(showtimesByTheatre).length === 0 ? (
                <div className="cinema-card p-4 text-center text-secondary small">
                  No showtimes scheduled on {formatDate(selectedDate)}.
                </div>
              ) : (
                Object.values(showtimesByTheatre).map(({ theatre, items }) => (
                  <div key={theatre?._id} className="cinema-card p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                      <div>
                        <h5 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                          <MapPin size={18} className="text-primary" />
                          <span>{theatre?.name}</span>
                        </h5>
                        <p className="text-secondary small mb-0">{theatre?.location}, {theatre?.city}</p>
                      </div>

                      {/* Amenities */}
                      <div className="d-flex flex-wrap gap-1">
                        {theatre?.amenities?.map((am, i) => (
                          <span key={i} className="badge bg-dark border border-secondary text-secondary small">
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtimes Pills */}
                    <div>
                      <span className="text-muted small d-block mb-2 text-uppercase">Available Slots</span>
                      <div className="d-flex flex-wrap gap-3">
                        {items.map((st) => (
                          <Link
                            key={st._id}
                            to={`/showtimes/${st._id}/seats`}
                            className="btn btn-cinema-secondary py-2 px-3 text-start position-relative group"
                          >
                            <div className="text-white fw-bold fs-6">
                              {formatTime(st.startTime)}
                            </div>
                            <div className="d-flex align-items-center gap-2 small text-secondary mt-1">
                              <span className="badge bg-primary bg-opacity-25 text-primary small">
                                {st.screen?.name || 'Screen 1'}
                              </span>
                              <span>From {formatCurrency(st.price?.standard)}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;

