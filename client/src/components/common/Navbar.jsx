import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, User, LogOut, Shield, Ticket, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="imovies-navbar py-3">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={() => setIsOpen(false)}>
          <Film size={28} className="text-primary" />
          <span>IMOVIES</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-cinema-secondary d-md-none p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop Nav Links */}
        <div className={`d-md-flex align-items-center gap-4 ${isOpen ? 'd-flex flex-column position-absolute top-100 start-0 w-100 bg-dark p-4 shadow-lg border-bottom border-secondary' : 'd-none'}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-light'}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/movies"
            className={({ isActive }) => `text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-light'}`}
            onClick={() => setIsOpen(false)}
          >
            Movies
          </NavLink>
          <NavLink
            to="/my-bookings"
            className={({ isActive }) => `text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-light'}`}
            onClick={() => setIsOpen(false)}
          >
            My Bookings
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `text-decoration-none fw-medium ${isActive ? 'text-primary' : 'text-light'}`}
            onClick={() => setIsOpen(false)}
          >
            About
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `text-decoration-none fw-semibold badge bg-primary px-3 py-2 text-white ${isActive ? 'bg-primary-dark shadow' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <Shield size={14} className="me-1" /> Admin Dashboard
            </NavLink>
          )}

          {/* User Controls */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-3">
                <Link
                  to="/profile"
                  className="btn btn-cinema-secondary py-1 px-3"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} />
                  <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-cinema-danger py-1 px-2"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-cinema-secondary py-1 px-3"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-cinema-primary py-1 px-3"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

