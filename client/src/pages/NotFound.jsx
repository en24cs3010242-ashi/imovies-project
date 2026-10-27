import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container py-5 text-center min-vh-75 d-flex flex-column align-items-center justify-content-center">
      <div className="p-4 rounded-circle bg-secondary bg-opacity-20 text-primary mb-4 shadow-lg">
        <Film size={64} className="opacity-75" />
      </div>
      <h1 className="display-1 fw-extrabold text-white mb-2 font-monospace">404</h1>
      <h3 className="text-white fw-bold mb-3">Scene Not Found</h3>
      <p className="text-secondary small col-md-6 mb-4">
        The cinema reel you are looking for does not exist, has been moved to another auditorium, or the link is expired.
      </p>
      <div className="d-flex gap-3">
        <Link to="/" className="btn btn-cinema-primary">
          <Home size={16} /> Return to Home
        </Link>
        <Link to="/movies" className="btn btn-cinema-secondary">
          Explore Movies
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

