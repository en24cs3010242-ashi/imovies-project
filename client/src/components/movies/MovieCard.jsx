import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Ticket, Info } from 'lucide-react';
import FallbackImage from '../common/FallbackImage';
import { formatDuration, formatDate } from '../../utils/formatters';

const MovieCard = ({ movie }) => {
  return (
    <div className="cinema-card h-100 d-flex flex-column">
      {/* Poster */}
      <div className="poster-container position-relative">
        <FallbackImage
          src={movie.posterUrl}
          alt={movie.title}
          className="poster-image"
        />

        {/* Rating Badge */}
        <div className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-warning border border-warning border-opacity-25 px-2 py-1 d-flex align-items-center gap-1 shadow">
          <Star size={14} className="fill-warning" />
          <span className="fw-bold">{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
        </div>

        {/* Status Badge */}
        <div className="position-absolute top-0 start-0 m-3">
          <span
            className={`badge ${
              movie.status === 'Coming Soon'
                ? 'bg-warning text-dark'
                : 'bg-primary text-white'
            }`}
          >
            {movie.status}
          </span>
        </div>

        {/* Hover overlay with brief details */}
        <div className="poster-overlay">
          <div className="d-flex flex-wrap gap-1 mb-2">
            {movie.genre?.slice(0, 2).map((g, idx) => (
              <span key={idx} className="badge bg-secondary bg-opacity-75 text-light small">
                {g}
              </span>
            ))}
          </div>
          <p className="text-light small text-truncate-2 mb-0" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.description}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <h5 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
            {movie.title}
          </h5>

          <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} />
              {formatDuration(movie.duration)}
            </span>
            <span>•</span>
            <span>{movie.language?.join(', ')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
          <Link
            to={`/movies/${movie._id}`}
            className="btn btn-cinema-secondary flex-fill justify-content-center py-2 px-2 small"
          >
            <Info size={14} />
            <span>Details</span>
          </Link>

          {movie.status === 'Now Showing' ? (
            <Link
              to={`/movies/${movie._id}?tab=booking`}
              className="btn btn-cinema-primary flex-fill justify-content-center py-2 px-2 small"
            >
              <Ticket size={14} />
              <span>Book</span>
            </Link>
          ) : (
            <button
              disabled
              className="btn btn-secondary flex-fill justify-content-center py-2 px-2 small opacity-50"
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

