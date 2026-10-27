import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

