import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingOrder, setBookingOrder] = useState(null);
  const [reservationExpiry, setReservationExpiry] = useState(null);

  const resetBooking = () => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setBookingOrder(null);
    setReservationExpiry(null);
  };

  const toggleSeatSelection = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatIdentifier === seat.seatIdentifier);
      if (exists) {
        return prev.filter((s) => s.seatIdentifier !== seat.seatIdentifier);
      }
      return [...prev, seat];
    });
  };

  const value = {
    selectedShowtime,
    setSelectedShowtime,
    selectedSeats,
    setSelectedSeats,
    toggleSeatSelection,
    bookingOrder,
    setBookingOrder,
    reservationExpiry,
    setReservationExpiry,
    resetBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

