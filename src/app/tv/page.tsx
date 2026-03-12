'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface Video {
  id: string;
  title: string;
  youtube_url?: string;
  thumbnail_url?: string;
  category: string;
  featured: boolean;
}

export default function TVMode() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmute, setShowUnmute] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (data.videos?.length > 0) setVideos(data.videos);
      });
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls) timeout = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  const nextVideo = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % videos.length);
  }, [videos.length]);

  const prevVideo = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen();
  }, []);

  const handleUnmute = () => {
    setIsMuted(false);
    setShowUnmute(false);
    setIframeKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setShowControls(true);
      if (e.key === 'ArrowRight') nextVideo();
      else if (e.key === 'ArrowLeft') prevVideo();
      else if (e.key === ' ') setShowControls(p => !p);
      else if (e.key === 'f') toggleFullscreen();
      else if (e.key === 'm') handleUnmute();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextVideo, prevVideo, toggleFullscreen]);

  const currentVideo = videos[currentIndex];

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0` : null;
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-gray-900 z-50" onMouseMove={() => setShowControls(true)}>
      <div className="w-full h-full flex items-center justify-center">
        {currentVideo?.youtube_url ? (
          <iframe 
            key={iframeKey}
            src={getYouTubeEmbedUrl(currentVideo.youtube_url) || ''} 
            className="w-full h-full" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
          />
        ) : currentVideo?.thumbnail_url ? (
          <div className="relative w-full h-full">
            <img src={currentVideo.thumbnail_url} alt={currentVideo.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
              <h2 className="text-3xl font-bold text-white mb-2">{currentVideo.title}</h2>
              <p className="text-white/70">{currentVideo.category}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-16 h-16 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className="text-white/60 text-xl">No videos available</p>
            <a href="/" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Go to Home</a>
          </div>
        )}
      </div>
      <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-8 flex justify-between items-center">
          <a href="/" className="text-white hover:text-blue-400 flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="text-sm">Back to Home</span>
          </a>
          <div className="flex items-center gap-4">
            {showUnmute && (
              <button 
                onClick={handleUnmute}
                className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors animate-pulse"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                Click to Unmute
              </button>
            )}
            <span className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE
            </span>
          </div>
        </div>
        {videos.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-center gap-8">
            <button onClick={prevVideo} className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={() => setShowControls(p => !p)} className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 shadow-2xl">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
            </button>
            <button onClick={nextVideo} className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
          <h2 className="text-3xl font-bold text-white mb-2">{currentVideo?.title || 'Select a video'}</h2>
          <span className="text-white/60">Video {currentIndex + 1} of {videos.length}</span>
        </div>
      </div>
    </div>
  );
}
