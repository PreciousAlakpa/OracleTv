'use client';

import { useEffect, useState, useRef } from 'react';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  youtube_url?: string;
  thumbnail_url?: string;
  category: string;
  featured: boolean;
  duration?: string;
  order_index?: number;
}

interface Slide {
  id: string;
  title: string;
  image_url: string;
}

interface Schedule {
  id: string;
  title: string;
  day: string;
  time: string;
  description?: string;
}

interface Settings {
  autoplay: boolean;
  darkMode: boolean;
  loopPlayback: boolean;
  continuousPlay: boolean;
}

interface VideoQueueItem {
  id: string;
  video_id: string;
  order_index: number;
}

const sampleVideos: Video[] = [
  { id: '1', title: 'Sunday Morning Worship Service', category: 'Live', featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800', duration: '2:45:00', description: 'Join us for our Sunday morning worship service' } as Video,
  { id: '2', title: 'Evening Prayer Session', category: 'Sermons', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800', duration: '1:30:00', description: 'A powerful evening prayer session' } as Video,
  { id: '3', title: 'Gospel Music Special', category: 'Music', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', duration: '45:00', description: 'Beautiful gospel music collection' } as Video,
  { id: '4', title: 'Faith Documentary: Journey of Belief', category: 'Movies', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', duration: '1:52:00', description: 'A compelling documentary about faith' } as Video,
  { id: '5', title: 'Bible Study: The Gospel of John', category: 'Sermons', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800', duration: '1:15:00', description: 'Deep dive into the Gospel of John' } as Video,
  { id: '6', title: 'Youth Conference 2024', category: 'Sermons', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', duration: '3:00:00', description: 'Annual youth conference highlights' } as Video,
  { id: '7', title: 'Praise & Worship Medley', category: 'Music', featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', duration: '32:00', description: 'Uplifting praise and worship songs' } as Video,
  { id: '8', title: 'Miracles of Jesus', category: 'Movies', featured: false, thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', duration: '2:10:00', description: 'A cinematic portrayal of miracles' } as Video,
];

const sampleSlides: Slide[] = [
  { id: '1', title: 'Welcome to AmbroseOvienlonbaTV', image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920' } as Slide,
  { id: '2', title: 'Live Sunday Service', image_url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920' } as Slide,
  { id: '3', title: 'Gospel Music Night', image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920' } as Slide,
];

const sampleSchedule: Schedule[] = [
  { id: '1', title: 'Morning Devotion', day: 'Monday', time: '06:00', description: 'Start your day with prayer' },
  { id: '2', title: 'Bible Study', day: 'Tuesday', time: '19:00', description: 'Weekly bible study session' },
  { id: '3', title: 'Midweek Service', day: 'Wednesday', time: '18:00', description: 'Midweek praise and worship' },
  { id: '4', title: 'Youth Fellowship', day: 'Friday', time: '17:00', description: 'Youth gathering and worship' },
  { id: '5', title: 'Sunday Service', day: 'Sunday', time: '09:00', description: 'Main Sunday worship service' },
];

const categories = ['All', 'Live', 'Sermons', 'Music', 'Movies', 'Shows', 'Kids'];

// Helper function to extract YouTube video ID from any YouTube URL format
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  // Handle various YouTube URL formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://youtube.com/embed/VIDEO_ID
  // - https://youtube.com/watch?v=VIDEO_ID&feature=share
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper function to get proper YouTube embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>(sampleVideos);
  const [slides, setSlides] = useState<Slide[]>(sampleSlides);
  const [schedule, setSchedule] = useState<Schedule[]>(sampleSchedule);
  const [settings, setSettings] = useState<Settings>({ autoplay: true, darkMode: false, loopPlayback: true, continuousPlay: true });
  const [videoQueue, setVideoQueue] = useState<VideoQueueItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showLiveScreen, setShowLiveScreen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState<string[]>(['splash']);

  // Fetch data from Supabase - videos stored in database show on ALL devices
  useEffect(() => {
    fetch('/api/videos').then(r => r.json()).then(d => d.videos?.length && setVideos(d.videos));
    fetch('/api/slides').then(r => r.json()).then(d => d.slides?.length && setSlides(d.slides));
    // Fetch video queue from Supabase
    fetch('/api/queue').then(r => r.json()).then(d => d.queue?.length && setVideoQueue(d.queue));
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || !showSplash) return;
    const i = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(i);
  }, [slides.length, showSplash]);

  const navigateTo = (screen: string) => {
    setHistoryStack(prev => [...prev, screen]);
    if (screen === 'splash') setShowSplash(true);
    else if (screen === 'live') setShowLiveScreen(true);
    else if (screen === 'admin') setShowAdmin(true);
    else setShowSplash(false);
  };

  const goBack = () => {
    if (historyStack.length > 1) {
      const newHistory = [...historyStack.slice(0, -1)];
      setHistoryStack(newHistory);
      const prevScreen = newHistory[newHistory.length - 1];
      if (prevScreen === 'splash') {
        setShowSplash(true);
        setShowLiveScreen(false);
        setShowAdmin(false);
        setSelectedVideo(null);
      } else if (prevScreen === 'home') {
        setShowSplash(false);
        setShowLiveScreen(false);
        setShowAdmin(false);
        setSelectedVideo(null);
      }
    }
  };

  const liveVideos = videos.filter(v => v.featured || v.category === 'Live');
  const sermonsVideos = videos.filter(v => v.category === 'Sermons');
  const musicVideos = videos.filter(v => v.category === 'Music');
  const moviesVideos = videos.filter(v => v.category === 'Movies');
  const filteredVideos = activeCategory === 'All' ? videos : videos.filter(v => v.category === activeCategory);
  const searchResults = searchQuery ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())) : null;

  // Get ordered video queue - videos play in this order
  const getOrderedVideos = (): Video[] => {
    if (videoQueue.length > 0) {
      // Use custom queue order
      return videoQueue
        .sort((a, b) => a.order_index - b.order_index)
        .map(q => videos.find(v => v.id === q.video_id))
        .filter((v): v is Video => v !== undefined);
    }
    // Default order: all videos
    return videos;
  };

  const orderedVideos = getOrderedVideos();

  // Play video within app (NOT opening YouTube)
  const playVideo = (v: Video) => {
    // Find index in ordered queue
    const idx = orderedVideos.findIndex(vid => vid.id === v.id);
    setCurrentVideoIndex(idx >= 0 ? idx : 0);
    setSelectedVideo(v);
    navigateTo('video');
  };

  // Play next video in queue
  const playNextVideo = () => {
    if (!settings.continuousPlay) return;
    
    const nextIndex = currentVideoIndex + 1;
    if (nextIndex < orderedVideos.length) {
      setCurrentVideoIndex(nextIndex);
      setSelectedVideo(orderedVideos[nextIndex]);
    } else if (settings.loopPlayback && orderedVideos.length > 0) {
      // Loop back to first video
      setCurrentVideoIndex(0);
      setSelectedVideo(orderedVideos[0]);
    }
  };

  // LIVE VIDEO SCREEN
  if (showLiveScreen) {
    return <LiveScreen onBack={goBack} videos={liveVideos} />;
  }

  // VIDEO PLAYER SCREEN - with autoplay next video
  if (selectedVideo) {
    return (
      <VideoPlayerScreen 
        video={selectedVideo} 
        onBack={() => { setSelectedVideo(null); goBack(); }} 
        autoplay={settings.autoplay}
        playNextVideo={playNextVideo}
        orderedVideos={orderedVideos}
        currentVideoIndex={currentVideoIndex}
        settings={settings}
      />
    );
  }

  // SPLASH SCREEN - Full screen image slider
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white">
        {slides.map((s, i) => (
          <div key={s.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
            <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 md:px-12 py-6 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-black text-white">AmbroseOvienlonba<span className="text-blue-500">TV</span></h1>
          <button onClick={() => navigateTo('admin')} className="text-white/90 hover:text-white text-sm px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">Admin</button>
        </nav>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 text-center italic">AmbroseOvienlonba<span className="text-blue-400">TV</span></h1>
          <p className="text-white/90 text-base md:text-lg mb-10">24/7 Christian Broadcasting Network</p>
          
          <button 
            onClick={() => { setShowSplash(false); navigateTo('home'); }} 
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition-all text-white"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </button>

          <p className="text-white/70 text-xs mt-4">Click to start streaming</p>

          <div className="absolute bottom-16 flex gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-10 bg-blue-500' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </div>

        {showAdmin && (
          <AdminPanel 
            onClose={() => setShowAdmin(false)} 
            videos={videos} 
            setVideos={setVideos} 
            slides={slides} 
            setSlides={setSlides}
            schedule={schedule}
            setSchedule={setSchedule}
            settings={settings}
            setSettings={setSettings}
          />
        )}
      </div>
    );
  }

  // MAIN APP - White background theme
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Side Menu Overlay */}
      {showSideMenu && (
        <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setShowSideMenu(false)} />
      )}
      
      {/* Side Menu */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[70] transform transition-transform duration-300 shadow-2xl ${showSideMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-blue-600">AOTV</h2>
            <button onClick={() => setShowSideMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', label: 'Home' },
              { id: 'live', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', label: 'Live TV' },
              { id: 'sermons', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Sermons' },
              { id: 'music', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', label: 'Music' },
              { id: 'movies', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z', label: 'Movies' },
              { id: 'schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Schedule' },
              { id: 'admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label: 'Admin' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setShowSideMenu(false);
                  if (item.id === 'live') setShowLiveScreen(true);
                  else if (item.id === 'admin') setShowAdmin(true);
                  else if (item.id === 'sermons') setActiveCategory('Sermons');
                  else if (item.id === 'music') setActiveCategory('Music');
                  else if (item.id === 'movies') setActiveCategory('Movies');
                  else setActiveCategory('All');
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${activeNav === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-12 py-4">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={() => setShowSideMenu(true)} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-full" title="Go Back">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => navigateTo('splash')} className="text-lg md:text-xl font-black text-blue-600 hover:opacity-80">
              AOTV
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={() => navigateTo('admin')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold text-white">Admin</button>
          </div>
        </div>
        {showSearch && (
          <div className="px-4 md:px-12 pb-4">
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full md:w-96 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500" 
              autoFocus 
            />
          </div>
        )}
      </header>

      {/* Category Tabs */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex gap-2 px-4 md:px-12 py-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh]">
        {slides[0] && (
          <>
            <img src={slides[0].image_url} alt={slides[0].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 via-transparent to-transparent" />
            <div className="absolute bottom-32 md:bottom-40 left-4 md:left-12 max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                </span>
                <span className="text-white/70 text-xs">Featured</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-3">{slides[0].title}</h2>
              <p className="text-white/70 text-sm md:text-base mb-6">Experience powerful teachings and worship from AmbroseOvienlonbaTV.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLiveScreen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold text-sm text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Watch Live
                </button>
                <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-bold text-sm text-white backdrop-blur-sm">More Info</button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Second Homepage Section - Featured Today */}
      <section className="relative -mt-10 z-10 px-4 md:px-12 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">✨ Featured Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.slice(0, 3).map((v, i) => (
              <div 
                key={v.id} 
                onClick={() => playVideo(v)}
                className="relative rounded-xl overflow-hidden cursor-pointer group aspect-video"
              >
                <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-bold text-sm line-clamp-1 text-white">{v.title}</p>
                  <p className="text-white/70 text-xs">{v.category} • {v.duration || '1:00:00'}</p>
                </div>
                {i === 0 && (
                  <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white">LIVE</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Rows */}
      <main className="relative pb-24 z-10">
        {searchResults ? (
          <div className="px-4 md:px-12">
            <h3 className="text-lg md:text-xl font-bold mb-4">Search Results ({searchResults.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {searchResults.map(v => (
                <VideoCard key={v.id} video={v} onClick={() => playVideo(v)} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeCategory !== 'All' && (
              <section className="px-4 md:px-12 mb-6">
                <h3 className="text-lg md:text-xl font-bold mb-4">{activeCategory} Videos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredVideos.map(v => (
                    <VideoCard key={v.id} video={v} onClick={() => playVideo(v)} />
                  ))}
                </div>
              </section>
            )}
            
            {activeCategory === 'All' && (
              <>
                {liveVideos.length > 0 && <ContentRow title="🔴 Live Now" videos={liveVideos} onClick={playVideo} />}
                <ContentRow title="Recently Added" videos={videos.slice(0, 6)} onClick={playVideo} />
                {sermonsVideos.length > 0 && <ContentRow title="Sermons & Teachings" videos={sermonsVideos} onClick={playVideo} />}
                {musicVideos.length > 0 && <ContentRow title="Gospel Music" videos={musicVideos} onClick={playVideo} />}
                {moviesVideos.length > 0 && <ContentRow title="Faith Movies" videos={moviesVideos} onClick={playVideo} />}
                <ContentRow title="All Content" videos={videos} onClick={playVideo} />
              </>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 md:hidden">
        <div className="flex items-center justify-around">
          <button onClick={() => { setActiveNav('home'); setActiveCategory('All'); setShowSearch(false); }} className={`flex flex-col items-center gap-1 ${activeNav === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className={`flex flex-col items-center gap-1 ${showSearch ? 'text-blue-600' : 'text-gray-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-xs">Search</span>
          </button>
          <button onClick={() => setShowLiveScreen(true)} className={`flex flex-col items-center gap-1 ${activeNav === 'live' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
            </div>
            <span className="text-xs">Live</span>
          </button>
          <button onClick={() => setShowAdmin(true)} className="flex flex-col items-center gap-1 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs">Admin</span>
          </button>
        </div>
      </nav>

      {showAdmin && (
        <AdminPanel 
          onClose={() => setShowAdmin(false)} 
          videos={videos} 
          setVideos={setVideos} 
          slides={slides} 
          setSlides={setSlides}
          schedule={schedule}
          setSchedule={setSchedule}
          settings={settings}
          setSettings={setSettings}
        />
      )}
    </div>
  );
}

// Live Screen Component - with TV logo and continuous playback
function LiveScreen({ onBack, videos, onPlayVideo }: { onBack: () => void; videos: Video[]; onPlayVideo?: (v: Video) => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentLiveIndex, setCurrentLiveIndex] = useState(0);
  const liveVideo = videos[currentLiveIndex] || videos[0];

  const playNextLive = () => {
    if (videos.length > 1) {
      setCurrentLiveIndex((prev) => (prev + 1) % videos.length);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-[100]">
      {/* TV Logo Watermark - Top Left */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="bg-blue-600 px-3 py-1.5 rounded-lg shadow-lg">
          <span className="text-white font-black text-sm">AOTV</span>
        </div>
      </div>

      {/* Back Button */}
      <button onClick={onBack} className="absolute top-4 left-24 z-20 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="text-sm">Back</span>
      </button>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {isMuted && (
          <button 
            onClick={() => setIsMuted(false)}
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors animate-pulse"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            Unmute
          </button>
        )}
        <span className="flex items-center gap-1.5 bg-red-600 px-3 py-1.5 rounded text-sm font-bold text-white">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE NOW
        </span>
      </div>

      {/* Video selector for multiple live videos */}
      {videos.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setCurrentLiveIndex(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === currentLiveIndex ? 'bg-blue-500 w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center">
        {liveVideo?.youtube_url && getYouTubeEmbedUrl(liveVideo.youtube_url) ? (
          <iframe 
            src={`${getYouTubeEmbedUrl(liveVideo.youtube_url)}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1`}
            className="w-full h-full" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
          />
        ) : liveVideo?.thumbnail_url ? (
          <div className="relative w-full h-full">
            <img src={liveVideo.thumbnail_url} alt={liveVideo.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="absolute inset-0 flex items-center justify-center"
            >
              {!isPlaying && (
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              )}
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{liveVideo.title}</h2>
              <p className="text-white/70">{liveVideo.description || 'Live broadcast from AmbroseOvienlonbaTV'}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold mb-2">No Live Stream Available</h2>
            <p className="text-white/60">Check back later for our next live broadcast</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Video Player Screen Component - with autoplay next video and TV logo
function VideoPlayerScreen({ 
  video, 
  onBack, 
  autoplay, 
  playNextVideo,
  orderedVideos,
  currentVideoIndex,
  settings
}: { 
  video: Video; 
  onBack: () => void; 
  autoplay: boolean;
  playNextVideo?: () => void;
  orderedVideos?: Video[];
  currentVideoIndex?: number;
  settings?: Settings;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showUpNext, setShowUpNext] = useState(false);
  
  // Listen for video end to autoplay next
  useEffect(() => {
    if (!settings?.continuousPlay || !playNextVideo) return;
    
    // Show "Up Next" notification before video ends
    const timer = setTimeout(() => {
      setShowUpNext(true);
    }, 5000); // Show after 5 seconds for demo
    
    return () => clearTimeout(timer);
  }, [video.id, settings?.continuousPlay, playNextVideo]);

  const nextVideo = orderedVideos && currentVideoIndex !== undefined 
    ? orderedVideos[currentVideoIndex + 1] 
    : null;

  return (
    <div className="fixed inset-0 bg-gray-900 z-[100]">
      {/* TV Logo Watermark - Top Left */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="bg-blue-600 px-3 py-1.5 rounded-lg">
          <span className="text-white font-black text-sm">AOTV</span>
        </div>
      </div>

      {/* Back Button - moved right to not overlap logo */}
      <button onClick={onBack} className="absolute top-4 left-24 z-20 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 text-white">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span className="text-sm">Back</span>
      </button>

      {/* Video Counter */}
      {orderedVideos && currentVideoIndex !== undefined && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 px-3 py-1.5 rounded-full text-white text-sm">
          {currentVideoIndex + 1} / {orderedVideos.length}
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl mx-auto">
          {video.youtube_url && getYouTubeEmbedUrl(video.youtube_url) ? (
            <iframe
              ref={iframeRef}
              src={`${getYouTubeEmbedUrl(video.youtube_url)}?autoplay=${autoplay ? 1 : 0}&enablejsapi=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full">
              <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-contain" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{video.title}</h2>
                <p className="text-white/70 text-sm mb-2">{video.description}</p>
                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span>{video.category}</span>
                  <span>•</span>
                  <span>{video.duration || '1:00:00'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Up Next Notification */}
      {showUpNext && nextVideo && settings?.continuousPlay && (
        <div className="absolute bottom-24 right-4 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-xs">
          <p className="text-white/70 text-xs mb-1">Up Next:</p>
          <p className="text-white font-medium text-sm mb-2 line-clamp-1">{nextVideo.title}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => playNextVideo?.()} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded font-medium"
            >
              Play Now
            </button>
            <button 
              onClick={() => setShowUpNext(false)} 
              className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-3 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Video Title Bar at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
        <h2 className="text-lg font-bold text-white mb-1">{video.title}</h2>
        <p className="text-white/60 text-xs">{video.category} • {video.duration || 'Live'}</p>
      </div>
    </div>
  );
}

// Content Row Component
function ContentRow({ title, videos, onClick }: { title: string; videos: Video[]; onClick: (v: Video) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(true);

  if (!videos.length) return null;

  const scroll = (d: 'left' | 'right') => ref.current?.scrollBy({ left: d === 'left' ? -ref.current.clientWidth * 0.8 : ref.current.clientWidth * 0.8, behavior: 'smooth' });
  const check = () => ref.current && (setLeft(ref.current.scrollLeft > 0), setRight(ref.current.scrollLeft < ref.current.scrollWidth - ref.current.clientWidth - 10));

  return (
    <section className="relative mb-6 md:mb-8">
      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 px-4 md:px-12">{title}</h3>
      {left && (
        <button onClick={() => scroll('left')} className="absolute left-0 top-12 z-10 w-10 h-32 bg-gradient-to-r from-white to-transparent flex items-center pl-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </div>
        </button>
      )}
      <div ref={ref} onScroll={check} className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-2">
        {videos.map(v => <VideoCard key={v.id} video={v} onClick={() => onClick(v)} />)}
      </div>
      {right && (
        <button onClick={() => scroll('right')} className="absolute right-0 top-12 z-10 w-10 h-32 bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-2">
          <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </button>
      )}
    </section>
  );
}

// Video Card Component
function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div 
      className="flex-shrink-0 w-32 md:w-44 cursor-pointer group relative" 
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => setHover(false)} 
      onClick={onClick}
    >
      <div className="relative rounded-md overflow-hidden aspect-video bg-gray-200 shadow-sm">
        <img src={video.thumbnail_url || 'https://via.placeholder.com/320x180'} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${hover ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        {video.featured && (
          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
            {video.duration}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-700 mt-1.5 line-clamp-1 font-medium">{video.title}</p>
    </div>
  );
}

// Draggable Video Queue Component with proper drag-and-drop
function DraggableVideoQueue({ videos, setVideos }: { videos: Video[]; setVideos: (v: Video[]) => void }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add visual feedback
    const target = e.target as HTMLElement;
    setTimeout(() => target.style.opacity = '0.5', 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder videos
    const newVideos = [...videos];
    const [draggedVideo] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(dropIndex, 0, draggedVideo);
    
    setVideos(newVideos);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Save new order to Supabase
    setSaving(true);
    try {
      // Update each video's order in the database
      for (let i = 0; i < newVideos.length; i++) {
        await fetch('/api/videos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: newVideos[i].id, 
            order_index: i 
          })
        });
      }
    } catch (err) {
      console.error('Error saving queue order:', err);
    }
    setSaving(false);
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newVideos = [...videos];
    [newVideos[index - 1], newVideos[index]] = [newVideos[index], newVideos[index - 1]];
    setVideos(newVideos);
    
    // Save to database
    setSaving(true);
    for (let i = 0; i < newVideos.length; i++) {
      await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newVideos[i].id, order_index: i })
      });
    }
    setSaving(false);
  };

  const moveDown = async (index: number) => {
    if (index === videos.length - 1) return;
    const newVideos = [...videos];
    [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    setVideos(newVideos);
    
    // Save to database
    setSaving(true);
    for (let i = 0; i < newVideos.length; i++) {
      await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newVideos[i].id, order_index: i })
      });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-800 mb-1">📺 Video Playback Queue</h3>
            <p className="text-sm text-blue-700">Drag videos to reorder. Changes sync to ALL devices automatically.</p>
          </div>
          {saving && (
            <span className="text-sm text-blue-600 flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              Saving...
            </span>
          )}
        </div>
      </div>

      {/* Draggable Queue List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-bold text-gray-700">Playback Order ({videos.length} videos)</h4>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <p>No videos in queue</p>
              <p className="text-sm mt-1">Add videos from the "Add Video" tab</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <div
                key={video.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center gap-4 p-4 cursor-move transition-all duration-200
                  ${draggedIndex === index ? 'opacity-50 bg-blue-50' : 'bg-white hover:bg-gray-50'}
                  ${dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-blue-500' : ''}
                `}
              >
                {/* Position Number */}
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>

                {/* Drag Handle */}
                <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Thumbnail */}
                <div className="w-24 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{video.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{video.category}</span>
                    <span>•</span>
                    <span>{video.duration || 'Live'}</span>
                    {video.featured && (
                      <>
                        <span>•</span>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">LIVE</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Move Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className={`p-1.5 rounded transition-colors ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === videos.length - 1}
                    className={`p-1.5 rounded transition-colors ${index === videos.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">How to reorder videos:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Drag & Drop:</strong> Click and drag any video to a new position</li>
          <li>• <strong>Arrow Buttons:</strong> Use ↑↓ buttons to move videos one position</li>
          <li>• Changes are saved automatically and sync to all devices</li>
        </ul>
      </div>
    </div>
  );
}

// Admin Panel Component with all features
function AdminPanel({ 
  onClose, 
  videos, 
  setVideos, 
  slides, 
  setSlides,
  schedule,
  setSchedule,
  settings,
  setSettings
}: { 
  onClose: () => void; 
  videos: Video[]; 
  setVideos: (v: Video[]) => void; 
  slides: Slide[]; 
  setSlides: (s: Slide[]) => void;
  schedule: Schedule[];
  setSchedule: (s: Schedule[]) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
}) {
  const [tab, setTab] = useState('videos');
  const [form, setForm] = useState({ title: '', category: 'Sermons', youtube_url: '', thumbnail_url: '', description: '', duration: '', featured: false });
  const [slideForm, setSlideForm] = useState({ title: '', image_url: '' });
  const [scheduleForm, setScheduleForm] = useState({ title: '', day: 'Monday', time: '09:00', description: '' });
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  const handleYouTubeUrlChange = (url: string) => {
    const thumbnail = getYouTubeThumbnail(url);
    setForm(prev => ({ ...prev, youtube_url: url, thumbnail_url: thumbnail || prev.thumbnail_url }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert('Video selected: ' + file.name + '. Upload to YouTube and paste the URL for best results, or use the video URL field.');
  };

  const addVideo = async () => {
    if (!form.title) return alert('Enter title');
    const res = await fetch('/api/videos', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    if (res.ok) { 
      const d = await res.json(); 
      setVideos([d.video, ...videos]); 
      setForm({ title: '', category: 'Sermons', youtube_url: '', thumbnail_url: '', description: '', duration: '', featured: false }); 
      alert('Video added! Visible on ALL devices.'); 
    }
  };

  const updateVideo = async () => {
    if (!editingVideo) return;
    const res = await fetch('/api/videos', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(editingVideo) 
    });
    if (res.ok) {
      setVideos(videos.map(v => v.id === editingVideo.id ? editingVideo : v));
      setEditingVideo(null);
      alert('Video updated!');
    }
  };

  const delVideo = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
    setVideos(videos.filter(v => v.id !== id));
  };

  const addSlide = async () => {
    if (!slideForm.title || !slideForm.image_url) return alert('Enter title and image URL');
    const res = await fetch('/api/slides', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(slideForm) 
    });
    if (res.ok) {
      const d = await res.json();
      setSlides([d.slide, ...slides]);
      setSlideForm({ title: '', image_url: '' });
      alert('Slide added!');
    }
  };

  const delSlide = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    await fetch(`/api/slides?id=${id}`, { method: 'DELETE' });
    setSlides(slides.filter(s => s.id !== id));
  };

  const addSchedule = () => {
    if (!scheduleForm.title) return alert('Enter title');
    const newSchedule = { ...scheduleForm, id: Date.now().toString() };
    setSchedule([...schedule, newSchedule]);
    setScheduleForm({ title: '', day: 'Monday', time: '09:00', description: '' });
    alert('Schedule added!');
  };

  const delSchedule = (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    setSchedule(schedule.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-2xl font-black text-blue-600">AOTV Creator Studio</h2>
          </div>
          <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200">Close</button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'videos', label: 'Videos' },
            { id: 'add', label: 'Add Video' },
            { id: 'queue', label: 'Video Queue' },
            { id: 'slides', label: 'Image Slider' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'settings', label: 'Settings' },
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'videos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(v => (
              <div key={v.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-video bg-gray-200 relative">
                  {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />}
                  {v.featured && <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold text-white">LIVE</div>}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">{v.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{v.category}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingVideo(v)} className="flex-1 text-xs bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition-colors">Edit</button>
                    <button onClick={() => delVideo(v.id)} className="flex-1 text-xs bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'add' && (
          <div className="max-w-lg">
            <h3 className="text-lg font-bold mb-4">Add New Video</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
              <input 
                placeholder="Video Title *" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
              />
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900"
              >
                <option value="Sermons">Sermons</option>
                <option value="Music">Music</option>
                <option value="Movies">Movies</option>
                <option value="Live">Live</option>
                <option value="Shows">Shows</option>
                <option value="Kids">Kids</option>
              </select>
              <input 
                placeholder="YouTube URL (thumbnail auto-detected)" 
                value={form.youtube_url} 
                onChange={e => handleYouTubeUrlChange(e.target.value)} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
              />
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="Thumbnail" className="w-48 h-28 object-cover rounded-lg border border-gray-200" />
              )}
              <input 
                placeholder="Thumbnail URL" 
                value={form.thumbnail_url} 
                onChange={e => setForm({...form, thumbnail_url: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
              />
              <input 
                placeholder="Duration (e.g., 1:30:00)" 
                value={form.duration} 
                onChange={e => setForm({...form, duration: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
              />
              <textarea 
                placeholder="Description" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 h-24 resize-none focus:border-blue-500 focus:outline-none" 
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})} 
                  className="w-5 h-5 rounded" 
                />
                <span className="text-sm text-gray-700">Featured / Live Video</span>
              </label>
              
              {/* Upload Video to Device */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Upload Video from Device</p>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  📁 Upload Video from Device
                </button>
                <p className="text-xs text-gray-500 mt-2">Tip: Upload to YouTube for best streaming quality</p>
              </div>
              
              <button onClick={addVideo} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors text-white">
                Add Video (Visible on ALL devices)
              </button>
            </div>
          </div>
        )}

        {tab === 'queue' && (
          <DraggableVideoQueue videos={videos} setVideos={setVideos} />
        )}

        {tab === 'slides' && (
          <div className="space-y-8">
            <div className="max-w-lg">
              <h3 className="text-lg font-bold mb-4">Add Slider Image</h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                <input 
                  placeholder="Slide Title *" 
                  value={slideForm.title} 
                  onChange={e => setSlideForm({...slideForm, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Image URL *" 
                  value={slideForm.image_url} 
                  onChange={e => setSlideForm({...slideForm, image_url: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
                />
                <button onClick={addSlide} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors text-white">
                  Add Slide
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Current Slides ({slides.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slides.map((s, i) => (
                  <div key={s.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <div className="aspect-video bg-gray-200 relative">
                      <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-blue-600 px-2 py-0.5 rounded text-xs font-bold text-white">#{i + 1}</div>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-sm text-gray-900 line-clamp-1">{s.title}</span>
                      <button onClick={() => delSlide(s.id)} className="text-red-600 text-xs hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="space-y-8">
            <div className="max-w-lg">
              <h3 className="text-lg font-bold mb-4">Add Programme Schedule</h3>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                <input 
                  placeholder="Programme Title *" 
                  value={scheduleForm.title} 
                  onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
                />
                <select 
                  value={scheduleForm.day} 
                  onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input 
                  type="time" 
                  value={scheduleForm.time} 
                  onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Description" 
                  value={scheduleForm.description} 
                  onChange={e => setScheduleForm({...scheduleForm, description: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none" 
                />
                <button onClick={addSchedule} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors text-white">
                  Add Schedule
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Weekly Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const daySchedule = schedule.filter(s => s.day === day);
                  return (
                    <div key={day} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h4 className="font-bold text-blue-600 mb-3">{day}</h4>
                      {daySchedule.length === 0 ? (
                        <p className="text-gray-400 text-sm">No programmes scheduled</p>
                      ) : (
                        <div className="space-y-2">
                          {daySchedule.map(s => (
                            <div key={s.id} className="flex items-center justify-between py-2 border-t border-gray-100">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{s.title}</p>
                                <p className="text-xs text-gray-500">{s.time}</p>
                              </div>
                              <button onClick={() => delSchedule(s.id)} className="text-red-600 text-xs hover:text-red-700">Delete</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-lg space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4">Playback Settings</h2>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="font-medium">Autoplay Videos</p>
                  <p className="text-sm text-gray-500">Automatically play videos when selected</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, autoplay: !settings.autoplay })}
                  className={`w-14 h-8 rounded-full transition-colors ${settings.autoplay ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.autoplay ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <p className="font-medium">Continuous Playback</p>
                  <p className="text-sm text-gray-500">Auto-play next video when current ends</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, continuousPlay: !settings.continuousPlay })}
                  className={`w-14 h-8 rounded-full transition-colors ${settings.continuousPlay ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.continuousPlay ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Loop Playback</p>
                  <p className="text-sm text-gray-500">Restart from first video when all finish</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, loopPlayback: !settings.loopPlayback })}
                  className={`w-14 h-8 rounded-full transition-colors ${settings.loopPlayback ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.loopPlayback ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-lg font-bold text-blue-800 mb-2">📺 TV Mode Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Videos play in queue order on all devices</li>
                <li>• AOTV logo watermark on all videos</li>
                <li>• No YouTube redirect - plays in app</li>
                <li>• Continuous playback without interruption</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold mb-4">App Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="text-gray-900">4.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform</span>
                  <span className="text-gray-900">Web & Mobile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <span className="text-gray-900">AmbroseOvienlonbaTV</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingVideo && (
          <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Edit Video</h3>
                <button onClick={() => setEditingVideo(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <input 
                  placeholder="Title" 
                  value={editingVideo.title} 
                  onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none" 
                />
                <select 
                  value={editingVideo.category} 
                  onChange={e => setEditingVideo({...editingVideo, category: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900"
                >
                  <option value="Sermons">Sermons</option>
                  <option value="Music">Music</option>
                  <option value="Movies">Movies</option>
                  <option value="Live">Live</option>
                  <option value="Shows">Shows</option>
                  <option value="Kids">Kids</option>
                </select>
                <input 
                  placeholder="YouTube URL" 
                  value={editingVideo.youtube_url || ''} 
                  onChange={e => setEditingVideo({...editingVideo, youtube_url: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Thumbnail URL" 
                  value={editingVideo.thumbnail_url || ''} 
                  onChange={e => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Duration" 
                  value={editingVideo.duration || ''} 
                  onChange={e => setEditingVideo({...editingVideo, duration: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:outline-none" 
                />
                <textarea 
                  placeholder="Description" 
                  value={editingVideo.description || ''} 
                  onChange={e => setEditingVideo({...editingVideo, description: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 h-20 resize-none focus:border-blue-500 focus:outline-none" 
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingVideo.featured || false} 
                    onChange={e => setEditingVideo({...editingVideo, featured: e.target.checked})} 
                    className="w-5 h-5 rounded" 
                  />
                  <span className="text-sm text-gray-700">Featured / Live Video</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingVideo(null)} className="flex-1 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors">Cancel</button>
                  <button onClick={updateVideo} className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 text-white transition-colors font-bold">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
