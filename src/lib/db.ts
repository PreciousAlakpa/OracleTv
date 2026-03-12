import { supabase, isSupabaseConfigured } from './supabase'

// Types
export interface Settings {
  id?: string
  site_name: string
  slider_interval: number
  youtube_live_url: string
  facebook_live_url: string
  tv_program_queue: string[]
}

export interface Slide {
  id: string
  image_url: string
  title: string
  order: number
}

export interface Video {
  id: string
  title: string
  description: string
  youtube_id: string
  video_url: string
  facebook_url: string
  thumbnail: string
  duration: number
  is_live: boolean
  category: string
  order: number
}

export interface PrayerRequest {
  id: string
  name: string
  request: string
  location: string
}

export interface Testimony {
  id: string
  name: string
  testimony: string
  location: string
  approved: boolean
}

// Settings
export async function getSettings(): Promise<Settings | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    console.error('Error fetching settings:', error)
    return null
  }
  
  return data
}

export async function updateSettings(settings: Partial<Settings>): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', settings.id || '1')
  
  if (error) {
    console.error('Error updating settings:', error)
    return false
  }
  
  return true
}

// Slides
export async function getSlides(): Promise<Slide[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    console.error('Error fetching slides:', error)
    return []
  }
  
  return data || []
}

export async function addSlide(slide: Omit<Slide, 'id'>): Promise<Slide | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('slides')
    .insert(slide)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding slide:', error)
    return null
  }
  
  return data
}

export async function updateSlide(id: string, slide: Partial<Slide>): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('slides')
    .update(slide)
    .eq('id', id)
  
  return !error
}

export async function deleteSlide(id: string): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('slides')
    .delete()
    .eq('id', id)
  
  return !error
}

// Videos
export async function getVideos(): Promise<Video[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('order', { ascending: true })
  
  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }
  
  return data || []
}

export async function addVideo(video: Omit<Video, 'id'>): Promise<Video | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding video:', error)
    return null
  }
  
  return data
}

export async function updateVideo(id: string, video: Partial<Video>): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('videos')
    .update(video)
    .eq('id', id)
  
  return !error
}

export async function deleteVideo(id: string): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id)
  
  return !error
}

// Prayer Requests
export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching prayer requests:', error)
    return []
  }
  
  return data || []
}

export async function addPrayerRequest(request: Omit<PrayerRequest, 'id'>): Promise<PrayerRequest | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .insert(request)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding prayer request:', error)
    return null
  }
  
  return data
}

// Testimonies
export async function getTestimonies(approvedOnly: boolean = true): Promise<Testimony[]> {
  if (!supabase) return []
  
  let query = supabase
    .from('testimonies')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (approvedOnly) {
    query = query.eq('approved', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching testimonies:', error)
    return []
  }
  
  return data || []
}

export async function addTestimony(testimony: Omit<Testimony, 'id'>): Promise<Testimony | null> {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('testimonies')
    .insert(testimony)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding testimony:', error)
    return null
  }
  
  return data
}

export async function approveTestimony(id: string): Promise<boolean> {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('testimonies')
    .update({ approved: true })
    .eq('id', id)
  
  return !error
}

// Export configuration status
export { isSupabaseConfigured }
