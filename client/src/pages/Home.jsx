import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movies/MovieCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertBanner from '../components/common/AlertBanner';
import { Film, Search, Star, Clock, Sparkles, ShieldCheck, Ticket, Play } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [nowShowingRes, comingSoonRes] = await Promise.all([
          movieService.getMovies({ status: 'Now Showing', limit: 8 }),
          movieService.getMovies({ status: 'Coming Soon', limit: 4 })
        ]);

        setNowShowing(nowShowingRes.movies || []);
        setComingSoon(comingSoonRes.movies || []);

        // Pick top featured movie
        const featured = (nowShowingRes.movies || []).find((m) => m.featured) || nowShowingRes.movies?.[0];
        setFeaturedMovie(featured);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching cinema highlights..." />;
  }

  return (
    <div>
      <AlertBanner type="danger" message={error} onClose={() => setError(null)} />

      {/* Hero Banner Section */}
      {featuredMovie && (
        <section className="position-relative mb-5 rounded-4 overflow-hidden shadow-lg mx-3 mx-lg-5" style={{ minHeight: '520px', background: '#0a0f1d' }}>
          {/* Background Banner with gradient */}
          <div
            className="position-absolute inset-0 w-100 h-100"
            style={{
              backgroundImage: `url(${featuredMovie.bannerUrl || featuredMovie.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35)'
            }}
          ></div>

          <div
            className="position-absolute inset-0 w-100 h-100"
            style={{
              background: 'linear-gradient(90deg, #070b19 0%, rgba(7, 11, 25, 0.8) 55%, transparent 100%)'
            }}
          ></div>

          {/* Banner Content */}
          <div className="position-relative container py-5 h-100 d-flex flex-column justify-content-center z-1">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1 d-flex align-items-center gap-1">
                    <Sparkles size={14} /> FEATURED PREMIERE
                  </span>
                  <span className="badge bg-dark bg-opacity-75 text-light border border-secondary border-opacity-50">
                    IMAX Laser & Dolby Atmos
                  </span>
                </div>

                <h1 className="display-4 fw-extrabold text-white mb-3">
                  {featuredMovie.title}
                </h1>

                <div className="d-flex align-items-center gap-3 text-secondary mb-3">
                  <span className="d-flex align-items-center gap-1 text-warning fw-bold">
                    <Star size={16} className="fill-warning" />
                    {featuredMovie.rating?.toFixed(1)} / 10
                  </span>
                  <span>•</span>
                  <span className="d-flex align-items-center gap-1 text-light">
                    <Clock size={16} />
                    {formatDuration(featuredMovie.duration)}
                  </span>
                  <span>•</span>
                  <span className="text-light">{featuredMovie.genre?.join(', ')}</span>
                </div>

                <p className="text-secondary lead fs-6 mb-4 col-lg-10" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featuredMovie.description}
                </p>

                <div className="d-flex flex-wrap gap-3">
                  <Link
                    to={`/movies/${featuredMovie._id}?tab=booking`}
                    className="btn btn-cinema-primary btn-lg px-4"
                  >
                    <Ticket size={20} />
                    <span>Book Tickets</span>
                  </Link>
                  <Link
                    to={`/movies/${featuredMovie._id}`}
                    className="btn btn-cinema-secondary btn-lg px-4"
                  >
                    <span>View Showtimes</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Search & Filter Bar */}
      <div className="container mb-5">
        <form onSubmit={handleSearchSubmit} className="cinema-card p-3 shadow-sm">
          <div className="row g-2 align-items-center">
            <div className="col-md-9">
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control cinema-input ps-5 py-2"
                  placeholder="Quick search movies by title, actor, or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={18}
                  className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                />
              </div>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-cinema-primary w-100 justify-content-center py-2">
                <Search size={18} />
                <span>Search Cinema</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Now Showing Section */}
      <section className="container mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <span className="text-primary text-uppercase fw-semibold small">Current Releases</span>
            <h3 className="text-white fw-bold mb-0">Now Showing</h3>
          </div>
          <Link to="/movies" className="btn btn-sm btn-cinema-secondary">
            View All Movies
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {nowShowing.map((movie) => (
            <div key={movie._id} className="col">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="container mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
            <div>
              <span className="text-warning text-uppercase fw-semibold small">Upcoming Titles</span>
              <h3 className="text-white fw-bold mb-0">Coming Soon</h3>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features / Platform Highlight */}
      <section className="container py-5 my-4 border-top border-secondary border-opacity-25">
        <div className="text-center mb-5">
          <span className="badge bg-primary text-uppercase px-3 py-1 mb-2">Cinema Experience</span>
          <h2 className="text-white fw-bold">Why Book with IMovies?</h2>
          <p className="text-secondary small">Engineered for ease, speed, and real-time cinema ticketing</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="cinema-card p-4 text-center h-100">
              <div className="p-3 rounded-circle bg-primary bg-opacity-15 text-primary d-inline-block mb-3">
                <Ticket size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Real-Time Interactive Seating</h5>
              <p className="text-secondary small mb-0">
                Visual cinema seating chart with atomic locks, tier pricing (VIP, Premium, Standard), and concurrency protection.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="cinema-card p-4 text-center h-100">
              <div className="p-3 rounded-circle bg-warning bg-opacity-15 text-warning d-inline-block mb-3">
                <ShieldCheck size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Safe Demo Payment Sandbox</h5>
              <p className="text-secondary small mb-0">
                Interactive demo gateway allowing you to test success, decline, and cancellation scenarios without real financial transactions.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="cinema-card p-4 text-center h-100">
              <div className="p-3 rounded-circle bg-info bg-opacity-15 text-info d-inline-block mb-3">
                <Film size={28} />
              </div>
              <h5 className="text-white fw-bold mb-2">Instant Ticket Receipt</h5>
              <p className="text-secondary small mb-0">
                Receive unique booking references, digital barcode tickets, and self-service cancellation with automatic refunds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

