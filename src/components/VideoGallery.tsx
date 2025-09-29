import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSignedUrl } from '../lib/supabase';

interface VideoGalleryProps {
  videos: string[];
  projectTitle: string;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedVideos, setProcessedVideos] = useState<string[]>([]);

  useEffect(() => {
    const processVideoUrls = async () => {
      const processed = await Promise.all(
        videos.map(async (video) => {
          try {
            const processedUrl = await getSignedUrl(video, 'video');
            return processedUrl;
          } catch (error) {
            console.error('Error processing video URL:', error);
            return video; // fallback to original URL
          }
        })
      );
      setProcessedVideos(processed);
    };

    if (videos.length > 0) {
      processVideoUrls();
    }
  }, [videos]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? processedVideos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === processedVideos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (videos.length === 0) {
    return (
      <div className="h-96 bg-gray-100 border border-black flex items-center justify-center">
        <span className="text-sm font-mono text-gray-500">NO VIDEOS</span>
      </div>
    );
  }

  // Show loading state while processing videos
  if (processedVideos.length === 0) {
    return (
      <div className="h-96 bg-gray-100 border border-black flex items-center justify-center">
        <span className="text-sm font-mono text-gray-500">LOADING VIDEOS...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Video Display */}
      <div>
        <div className="relative group inline-block">
          {processedVideos.length > 0 && (
            <video
              src={processedVideos[currentIndex]}
              controls
              className="max-h-[70vh] w-auto border border-black bg-gray-100 block"
              key={currentIndex} // Force re-render when video changes
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Navigation Arrows - Only show if more than 1 video */}
          {processedVideos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black hover:text-white"
                aria-label="Previous video"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black hover:text-white"
                aria-label="Next video"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Video Counter */}
          {processedVideos.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-white border border-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs font-mono">
                {currentIndex + 1} / {processedVideos.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip - Only show if more than 1 video */}
      {processedVideos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {processedVideos.map((video, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 h-16 w-16 border overflow-hidden hover:border-black transition-colors relative ${
                index === currentIndex ? 'border-black' : 'border-gray-300'
              }`}
            >
              <video
                src={video}
                className="h-full w-full object-cover"
                muted
                preload="metadata"
                style={{ pointerEvents: 'none' }}
              >
                <source src={video} />
              </video>
              {/* Video play icon overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
              </div>
              {/* Video number */}
              <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-1 leading-tight">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;