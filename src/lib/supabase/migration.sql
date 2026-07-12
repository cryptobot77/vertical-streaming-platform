-- Migration: Add processing_status, source_video_url to episodes
-- and create social tables (likes, comments, follows)
-- Run this against your existing Supabase database

-- Add new columns to episodes table
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS source_video_url text;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'ready';
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now());

-- Add check constraint for processing_status
DO $$ BEGIN
  ALTER TABLE public.episodes ADD CONSTRAINT episodes_processing_status_check
    CHECK (processing_status in ('processing', 'ready', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create LIKES table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  episode_id uuid references public.episodes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, episode_id)
);

-- Create COMMENTS table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  episode_id uuid references public.episodes(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create FOLLOWS table
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (follower_id, following_id)
);

-- Enable RLS on new tables
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- LIKES RLS
DO $$ BEGIN
  CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- COMMENTS RLS
DO $$ BEGIN
  CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- FOLLOWS RLS
DO $$ BEGIN
  CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can insert follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_episodes_mux_asset ON public.episodes(mux_asset_id);
CREATE INDEX IF NOT EXISTS idx_episodes_processing ON public.episodes(processing_status);
CREATE INDEX IF NOT EXISTS idx_likes_episode ON public.likes(episode_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_episode ON public.likes(user_id, episode_id);
CREATE INDEX IF NOT EXISTS idx_comments_episode ON public.comments(episode_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
