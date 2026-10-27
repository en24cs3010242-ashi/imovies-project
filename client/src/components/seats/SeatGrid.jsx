import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const SeatGrid = ({ grid = [], selectedSeats = [], onToggleSeat }) => {
  return (
    <div className="w-100 py-3">
      {/* Cinema Screen Curve */}
      <div className="screen-container">
        <div className="screen-curve"></div>
        <div className="screen-text">Cinema Screen This Way</div>
      </div>

      {/* Seats Grid */}
      <div className="seat-grid-container">
        <div className="d-inline-block">
          {grid.map((rowItem) => {
            return (
              <div key={rowItem.row} className="seat-row">
                {/* Left Row Label */}
                <div className="row-label">{rowItem.row}</div>

                {/* Seats */}
                <div className="d-flex gap-2">
                  {rowItem.seats.map((seat) => {
                    const isSelected = selectedSeats.some(
                      (s) => s.seatIdentifier === seat.seatIdentifier
                    );

                    let statusClass = seat.status; // 'available', 'reserved', 'booked'
                    if (isSelected) {
                      statusClass = 'selected';
                    }

                    const isClickable =
                      seat.status === 'available' || isSelected || seat.status === 'selected';

                    return (
                      <div
                        key={seat.seatIdentifier}
                        className={`seat-box ${statusClass}`}
                        onClick={() => isClickable && onToggleSeat(seat)}
                        title={`${seat.seatIdentifier} (${seat.tier}) - ${formatCurrency(
                          seat.price
                        )} - ${statusClass.toUpperCase()}`}
                      >
                        {seat.col}
                      </div>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <div className="row-label">{rowItem.row}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;

