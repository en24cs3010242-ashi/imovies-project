import React, { useState } from 'react';
import { FALLBACK_POSTER } from '../../utils/formatters';

const FallbackImage = ({ src, alt, className, style, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_POSTER);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_POSTER);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Movie poster'}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
};

export default FallbackImage;

