-- TRUMPETER TV Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'TRUMPETER TV',
  slider_interval INTEGER DEFAULT 6000,
  youtube_live_url TEXT DEFAULT '',
  facebook_live_url TEXT DEFAULT '',
  tv_program_queue TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (site_name, slider_interval)
VALUES ('TRUMPETER TV', 6000)
ON CONFLICT DO NOTHING;

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  youtube_id TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'sermon',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'Anonymous',
  request TEXT NOT NULL,
  location TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonies table
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT 'Anonymous',
  testimony TEXT NOT NULL,
  location TEXT DEFAULT '',
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can read slides" ON slides FOR SELECT USING (true);
CREATE POLICY "Public can read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public can read prayer_requests" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "Public can read approved testimonies" ON testimonies FOR SELECT USING (approved = true);

-- Create policies for public write access (for now - you can restrict later)
CREATE POLICY "Public can insert slides" ON slides FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update slides" ON slides FOR UPDATE USING (true);
CREATE POLICY "Public can delete slides" ON slides FOR DELETE USING (true);

CREATE POLICY "Public can insert videos" ON videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update videos" ON videos FOR UPDATE USING (true);
CREATE POLICY "Public can delete videos" ON videos FOR DELETE USING (true);

CREATE POLICY "Public can insert prayer_requests" ON prayer_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert testimonies" ON testimonies FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update settings" ON settings FOR UPDATE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_order ON videos("order");
CREATE INDEX IF NOT EXISTS idx_slides_order ON slides("order");
CREATE INDEX IF NOT EXISTS idx_testimonies_approved ON testimonies(approved);
