import React from 'react';

const AdminStatCard = ({ title, value, icon, subtitle, color = 'primary' }) => {
  return (
    <div className="cinema-card p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="text-secondary small fw-medium text-uppercase">{title}</span>
        <div className={`p-2 rounded bg-${color} bg-opacity-15 text-${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-white fw-bold mb-1">{value}</h3>
      {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
    </div>
  );
};

export default AdminStatCard;

