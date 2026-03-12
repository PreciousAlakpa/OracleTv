'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnail_url?: string;
  youtube_url?: string;
  video_url?: string;
  duration?: string;
  featured?: boolean;
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

export default function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form, setForm] = useState({ 
    title: '', 
    category: 'Sermons', 
    youtube_url: '', 
    thumbnail_url: '', 
    description: '', 
    duration: '',
    featured: false 
  });
  const [slideForm, setSlideForm] = useState({ title: '', image_url: '' });
  const [scheduleForm, setScheduleForm] = useState({ title: '', day: 'Monday', time: '09:00', description: '' });
  const [settings, setSettings] = useState({ autoplay: true, darkMode: true });

  // Extract YouTube thumbnail from URL
  const getYouTubeThumbnail = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  };

  // Auto-fill thumbnail when YouTube URL changes
  const handleYouTubeUrlChange = (url: string) => {
    setForm(prev => {
      const thumbnail = getYouTubeThumbnail(url);
      return { ...prev, youtube_url: url, thumbnail_url: thumbnail || prev.thumbnail_url };
    });
  };

  useEffect(() => {
    fetch('/api/videos').then(r => r.json()).then(d => d.videos && setVideos(d.videos));
    fetch('/api/slides').then(r => r.json()).then(d => d.slides && setSlides(d.slides));
  }, []);

  const addVideo = async () => {
    if (!form.title) return alert('Enter title');
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const data = await res.json();
      setVideos([data.video, ...videos]);
      setForm({ title: '', category: 'Sermons', youtube_url: '', thumbnail_url: '', description: '', duration: '', featured: false });
      alert('Video added!');
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

  const deleteVideo = async (id: string) => {
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

  const deleteSlide = async (id: string) => {
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

  const deleteSchedule = (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    setSchedule(schedule.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm">Back to Site</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-xl font-bold"><span className="text-blue-500">AOTV</span> Creator Studio</h1>
          </div>
          <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold">View Site</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'videos', label: 'Videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { id: 'add', label: 'Add Video', icon: 'M12 4v16m8-8H4' },
            { id: 'slides', label: 'Image Slider', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} /></svg>
              {t.label}
            </button>
          ))}
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">All Videos ({videos.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map(v => (
                <div key={v.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
                  <div className="aspect-video bg-gray-800 relative">
                    {v.thumbnail_url && <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />}
                    {v.featured && <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold"><span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE</div>}
                    {v.duration && <div className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px]">{v.duration}</div>}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-1 mb-1">{v.title}</p>
                    <p className="text-xs text-white/50 mb-3">{v.category}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingVideo(v)} className="flex-1 text-xs bg-blue-600/20 text-blue-400 py-2 rounded hover:bg-blue-600/30 transition-colors">Edit</button>
                      <button onClick={() => deleteVideo(v.id)} className="flex-1 text-xs bg-red-600/20 text-red-400 py-2 rounded hover:bg-red-600/30 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/50">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p>No videos yet. Add your first video!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Video Tab */}
        {activeTab === 'add' && (
          <div className="max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add New Video</h2>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <input 
                placeholder="Video Title *" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
              />
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white"
              >
                <option value="Sermons">Sermons</option>
                <option value="Music">Music</option>
                <option value="Movies">Movies</option>
                <option value="Live">Live</option>
                <option value="Shows">Shows</option>
                <option value="Kids">Kids</option>
              </select>
              <input 
                placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)" 
                value={form.youtube_url} 
                onChange={e => handleYouTubeUrlChange(e.target.value)} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
              />
              {form.youtube_url && getYouTubeThumbnail(form.youtube_url) && (
                <img src={getYouTubeThumbnail(form.youtube_url) || ''} alt="Thumbnail" className="w-48 h-28 object-cover rounded-lg border border-white/10" />
              )}
              <input 
                placeholder="Thumbnail URL" 
                value={form.thumbnail_url} 
                onChange={e => setForm({...form, thumbnail_url: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
              />
              <input 
                placeholder="Duration (e.g., 1:30:00)" 
                value={form.duration} 
                onChange={e => setForm({...form, duration: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
              />
              <textarea 
                placeholder="Description" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 h-24 resize-none focus:border-blue-500 focus:outline-none" 
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.featured} 
                  onChange={e => setForm({...form, featured: e.target.checked})} 
                  className="w-5 h-5 rounded" 
                />
                <span className="text-sm">Featured / Live Video</span>
              </label>
              <button onClick={addVideo} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors">
                Add Video
              </button>
            </div>
          </div>
        )}

        {/* Image Slider Tab */}
        {activeTab === 'slides' && (
          <div className="space-y-8">
            <div className="max-w-lg">
              <h2 className="text-lg font-bold mb-4">Add Slider Image</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <input 
                  placeholder="Slide Title *" 
                  value={slideForm.title} 
                  onChange={e => setSlideForm({...slideForm, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Image URL *" 
                  value={slideForm.image_url} 
                  onChange={e => setSlideForm({...slideForm, image_url: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
                />
                <button onClick={addSlide} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors">
                  Add Slide
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-bold mb-4">Current Slides ({slides.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {slides.map((s, i) => (
                  <div key={s.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                    <div className="aspect-video bg-gray-800 relative">
                      <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/50 px-2 py-0.5 rounded text-xs font-bold">#{i + 1}</div>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-sm line-clamp-1">{s.title}</span>
                      <button onClick={() => deleteSlide(s.id)} className="text-red-400 text-xs hover:text-red-300">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div className="max-w-lg">
              <h2 className="text-lg font-bold mb-4">Add Programme Schedule</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <input 
                  placeholder="Programme Title *" 
                  value={scheduleForm.title} 
                  onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
                />
                <select 
                  value={scheduleForm.day} 
                  onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input 
                  type="time" 
                  value={scheduleForm.time} 
                  onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Description" 
                  value={scheduleForm.description} 
                  onChange={e => setScheduleForm({...scheduleForm, description: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/50 focus:border-blue-500 focus:outline-none" 
                />
                <button onClick={addSchedule} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors">
                  Add Schedule
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Weekly Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const daySchedule = schedule.filter(s => s.day === day);
                  return (
                    <div key={day} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h3 className="font-bold text-blue-400 mb-3">{day}</h3>
                      {daySchedule.length === 0 ? (
                        <p className="text-white/40 text-sm">No programmes scheduled</p>
                      ) : (
                        <div className="space-y-2">
                          {daySchedule.map(s => (
                            <div key={s.id} className="flex items-center justify-between py-2 border-t border-white/5">
                              <div>
                                <p className="text-sm font-medium">{s.title}</p>
                                <p className="text-xs text-white/50">{s.time}</p>
                              </div>
                              <button onClick={() => deleteSchedule(s.id)} className="text-red-400 text-xs hover:text-red-300">Delete</button>
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-lg space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-4">Playback Settings</h2>
              
              {/* Autoplay Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="font-medium">Autoplay Videos</p>
                  <p className="text-sm text-white/50">Automatically play videos when selected</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, autoplay: !settings.autoplay })}
                  className={`w-14 h-8 rounded-full transition-colors ${settings.autoplay ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.autoplay ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-white/50">Use dark theme throughout the app</p>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                  className={`w-14 h-8 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-white/20'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold mb-4">App Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Version</span>
                  <span>2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Platform</span>
                  <span>Web & Mobile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Network</span>
                  <span>AmbroseOvienlonbaTV</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Video Modal */}
        {editingVideo && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Video</h3>
                <button onClick={() => setEditingVideo(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <input 
                  placeholder="Title" 
                  value={editingVideo.title} 
                  onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white focus:border-blue-500 focus:outline-none" 
                />
                <select 
                  value={editingVideo.category} 
                  onChange={e => setEditingVideo({...editingVideo, category: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white"
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
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Thumbnail URL" 
                  value={editingVideo.thumbnail_url || ''} 
                  onChange={e => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white focus:border-blue-500 focus:outline-none" 
                />
                <input 
                  placeholder="Duration" 
                  value={editingVideo.duration || ''} 
                  onChange={e => setEditingVideo({...editingVideo, duration: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white focus:border-blue-500 focus:outline-none" 
                />
                <textarea 
                  placeholder="Description" 
                  value={editingVideo.description || ''} 
                  onChange={e => setEditingVideo({...editingVideo, description: e.target.value})} 
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white h-20 resize-none focus:border-blue-500 focus:outline-none" 
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingVideo.featured || false} 
                    onChange={e => setEditingVideo({...editingVideo, featured: e.target.checked})} 
                    className="w-5 h-5 rounded" 
                  />
                  <span className="text-sm">Featured / Live Video</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingVideo(null)} className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">Cancel</button>
                  <button onClick={updateVideo} className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-bold">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
