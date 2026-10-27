import React from 'react';
import { Film } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading cinema data...', fullPage = false }) => {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center p-5 ${
        fullPage ? 'min-vh-100' : 'py-5'
      }`}
    >
      <div className="position-relative mb-3">
        <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <Film
          size={20}
          className="text-primary position-absolute top-50 start-50 translate-middle"
        />
      </div>
      <p className="text-secondary fw-medium mb-0 small">{text}</p>
    </div>
  );
};

export default LoadingSpinner;

