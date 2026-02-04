-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Usage records table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  requests INTEGER DEFAULT 0,
  co2_grams DECIMAL(10, 2) DEFAULT 0,
  ai_service TEXT,
  recorded_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Teams policies - allow all for authenticated users
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_insert" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_update" ON public.teams FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Profiles policies - allow all for authenticated users
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- AI Usage policies - allow all for authenticated users
CREATE POLICY "ai_usage_select" ON public.ai_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_usage_insert" ON public.ai_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_usage_update" ON public.ai_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_team_id ON public.ai_usage(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_recorded_at ON public.ai_usage(recorded_at);
