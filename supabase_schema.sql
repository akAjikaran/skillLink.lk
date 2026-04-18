-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  social_links JSONB DEFAULT '{}',
  image_url TEXT,
  rating NUMERIC DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Service Providers
DROP POLICY IF EXISTS "Service providers are viewable by everyone" ON service_providers;
CREATE POLICY "Service providers are viewable by everyone" 
ON service_providers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own service profile" ON service_providers;
CREATE POLICY "Users can insert their own service profile" 
ON service_providers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own service profile" ON service_providers;
CREATE POLICY "Users can update their own service profile" 
ON service_providers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own service profile" ON service_providers;
CREATE POLICY "Users can delete their own service profile" 
ON service_providers FOR DELETE USING (auth.uid() = user_id);

-- Trigger to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Categories (Using ON CONFLICT to prevent duplicates)
INSERT INTO categories (name, slug, icon) VALUES
('Plumber', 'plumber', 'wrench'),
('Electrician', 'electrician', 'zap'),
('IT Support', 'it-support', 'laptop'),
('Designer', 'designer', 'palette'),
('Creative Services', 'creative', 'sparkles'),
('Teachers & Tutors', 'teacher', 'book-open'),
('Lawyers', 'lawyer', 'scale'),
('Doctors', 'doctor', 'stethoscope'),
('Fashion Makers', 'fashion', 'shirt'),
('Other Services', 'other', 'briefcase')
ON CONFLICT (slug) DO NOTHING;
