import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0 min-vh-100">
          <div className="col-lg-2 col-md-3">
            <AdminSidebar />
          </div>
          <div className="col-lg-10 col-md-9 p-4 bg-dark">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

