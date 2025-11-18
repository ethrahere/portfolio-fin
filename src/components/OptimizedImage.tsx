import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-xs font-mono text-gray-400">IMAGE NOT FOUND</span>
      </div>
    );
  }

  return (
    <>
      {/* Blur placeholder while loading */}
      {!isLoaded && (
        <div className={`bg-gray-200 animate-pulse ${className}`} />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'hidden' : 'block'} transition-opacity duration-300`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </>
  );
};

export default OptimizedImage;
