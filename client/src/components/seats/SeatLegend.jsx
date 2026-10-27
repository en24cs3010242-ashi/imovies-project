import React from 'react';

const SeatLegend = () => {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 py-3 border-top border-bottom border-secondary border-opacity-25 mb-4">
      {/* States */}
      <div className="d-flex align-items-center gap-2">
        <div className="seat-box available" style={{ width: '22px', height: '22px' }}></div>
        <span className="small text-secondary">Available</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="seat-box selected" style={{ width: '22px', height: '22px' }}></div>
        <span className="small text-secondary">Selected</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="seat-box reserved" style={{ width: '22px', height: '22px' }}></div>
        <span className="small text-secondary">Reserved (Hold)</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <div className="seat-box booked" style={{ width: '22px', height: '22px' }}></div>
        <span className="small text-secondary">Sold Out</span>
      </div>

      <div className="vr bg-secondary d-none d-md-block opacity-25" style={{ height: '20px' }}></div>

      {/* Tiers */}
      <div className="d-flex align-items-center gap-2">
        <span className="badge badge-vip px-2 py-1">VIP (Row A-B)</span>
        <span className="badge badge-premium px-2 py-1">Premium (Row C-E)</span>
        <span className="badge badge-standard px-2 py-1">Standard (Row F-H)</span>
      </div>
    </div>
  );
};

export default SeatLegend;

