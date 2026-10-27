import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="imovies-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="brand-logo mb-3">
              <Film size={26} className="text-primary" />
              <span>IMOVIES</span>
            </Link>
            <p className="text-secondary small mt-2">
              The premier full-stack cinema booking application designed for modern moviegoers. Seamlessly browse, reserve seats, and experience cinema at its finest.
            </p>
            <div className="d-flex align-items-center gap-2 text-warning small mt-3">
              <ShieldCheck size={16} />
              <span>Academic & Portfolio Project (Demo Payment Mode Only)</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3">Quick Navigation</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li><Link to="/movies" className="text-secondary text-decoration-none">Explore Movies</Link></li>
              <li><Link to="/my-bookings" className="text-secondary text-decoration-none">My Bookings</Link></li>
              <li><Link to="/about" className="text-secondary text-decoration-none">About Platform</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-3 col-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3">Account & Security</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/login" className="text-secondary text-decoration-none">User Login</Link></li>
              <li><Link to="/register" className="text-secondary text-decoration-none">Create Account</Link></li>
              <li><Link to="/profile" className="text-secondary text-decoration-none">Manage Profile</Link></li>
              <li><Link to="/admin" className="text-secondary text-decoration-none">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white text-uppercase small fw-bold mb-3">Supported Locations</h6>
            <p className="text-secondary small mb-2">
              New York • Los Angeles • Chicago • Mumbai • London
            </p>
            <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 mt-3">
              <span className="badge bg-primary mb-1">MERN Stack 2026</span>
              <p className="text-muted small mb-0">
                React • Node.js • Express • MongoDB • JWT • Bootstrap 5
              </p>
            </div>
          </div>
        </div>

        <div className="border-top border-secondary border-opacity-25 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} IMovies Cinema Platform. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-1">
            Built with <Heart size={14} className="text-danger fill-danger" /> by Full-Stack Engineering Team
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

