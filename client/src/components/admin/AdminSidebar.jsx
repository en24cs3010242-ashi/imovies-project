import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building,
  Calendar,
  Ticket,
  Users,
  ArrowLeft
} from 'lucide-react';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar p-3 d-flex flex-column justify-content-between h-100">
      <div>
        <div className="px-3 py-2 mb-3 border-bottom border-secondary border-opacity-25">
          <span className="badge bg-primary text-uppercase letter-spacing-1">Admin Portal</span>
          <h6 className="text-white fw-bold mb-0 mt-2">Management Suite</h6>
        </div>

        <nav className="nav flex-column gap-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/movies"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Film size={18} />
            <span>Movies</span>
          </NavLink>

          <NavLink
            to="/admin/theatres"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Building size={18} />
            <span>Theatres & Screens</span>
          </NavLink>

          <NavLink
            to="/admin/showtimes"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Showtimes</span>
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Ticket size={18} />
            <span>All Bookings</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
        </nav>
      </div>

      <div className="pt-3 border-top border-secondary border-opacity-25">
        <Link to="/" className="btn btn-cinema-secondary w-100 justify-content-center small py-2">
          <ArrowLeft size={16} />
          <span>Back to Main Cinema</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;

