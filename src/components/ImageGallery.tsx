import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  projectTitle: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, projectTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="h-96 bg-gray-100 border border-black flex items-center justify-center">
        <span className="text-sm font-mono text-gray-500">NO IMAGES</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Display */}
      <div>
        <div className="relative group inline-block">
          <img 
            src={images[currentIndex]}
            alt={`${projectTitle} - Image ${currentIndex + 1}`}
            className="max-h-[70vh] w-auto border border-black bg-gray-100 block"
          />
          
          {/* Navigation Arrows - Only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black hover:text-white"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black hover:text-white"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-white border border-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs font-mono">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip - Only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 h-16 w-16 border overflow-hidden hover:border-black transition-colors ${
                index === currentIndex ? 'border-black' : 'border-gray-300'
              }`}
            >
              <img 
                src={image}
                alt={`${projectTitle} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;