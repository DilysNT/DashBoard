import React, { useState } from 'react';
import { getImageUrl, isCloudinaryUrl } from '../utils/cloudinary';

const CloudinaryImage = ({ 
  publicId, 
  src, 
  alt, 
  size = 'medium', // thumbnail, small, medium, large, original, avatar
  className = '', 
  fallbackSrc = '/placeholder-image.jpg',
  loading = 'lazy',
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the image source
  const getImageSrc = () => {
    if (imageError) return fallbackSrc;
    
    // If publicId is provided, use Cloudinary optimization
    if (publicId) {
      return getImageUrl[size] ? getImageUrl[size](publicId) : getImageUrl.medium(publicId);
    }
    
    // If src is provided and it's a Cloudinary URL, use it directly
    if (src && isCloudinaryUrl(src)) {
      return src;
    }
    
    // Otherwise use the provided src or fallback
    return src || fallbackSrc;
  };

  const handleImageError = (e) => {
    setImageError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={getImageSrc()}
        alt={alt}
        loading={loading}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default CloudinaryImage;
