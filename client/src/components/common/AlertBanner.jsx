import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const AlertBanner = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const icons = {
    danger: <AlertCircle size={20} className="text-danger flex-shrink-0" />,
    success: <CheckCircle size={20} className="text-success flex-shrink-0" />,
    warning: <AlertCircle size={20} className="text-warning flex-shrink-0" />,
    info: <Info size={20} className="text-info flex-shrink-0" />
  };

  const borderStyles = {
    danger: 'border-danger bg-danger',
    success: 'border-success bg-success',
    warning: 'border-warning bg-warning',
    info: 'border-info bg-info'
  };

  return (
    <div
      className={`alert border bg-opacity-10 d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 ${borderStyles[type] || borderStyles.danger}`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-2">
        {icons[type] || icons.danger}
        <span className="small text-white">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close btn-close-white ms-3"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default AlertBanner;

