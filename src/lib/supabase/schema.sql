-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  display_name text,
  avatar_url text,
  role text check (role in ('viewer', 'creator', 'admin')) default 'viewer',
  is_premium boolean default false,
  constraint username_length check (char_length(username) >= 3)
);

-- 2. SERIES TABLE (Intellectual Property structural layer)
create table public.series (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  cover_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_flagship boolean default false
);

-- 3. EPISODES TABLE (Optimized for Mobile-First Vertical Video)
create table public.episodes (
  id uuid default uuid_generate_v4() primary key,
  series_id uuid references public.series(id) on delete cascade not null,
  title text not null,
  description text,
  episode_number integer not null,
  hls_playback_url text,
  source_video_url text,
  mux_asset_id text,
  processing_status text default 'ready' check (processing_status in ('processing', 'ready', 'failed')),
  duration_seconds integer,
  is_premium_locked boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (series_id, episode_number)
);

-- 4. SUBSCRIPTIONS
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  status text,
  price_id text,
  current_period_end timestamp with time zone
);

-- 5. LIKES
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  episode_id uuid references public.episodes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, episode_id)
);

-- 6. COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  episode_id uuid references public.episodes(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. FOLLOWS
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (follower_id, following_id)
);

-- Row-Level Security (RLS)

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.series enable row level security;
alter table public.episodes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- PROFILES RLS POLICIES
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete using (auth.uid() = id);

-- SERIES RLS POLICIES
create policy "Series are viewable by everyone"
  on public.series for select using (true);

create policy "Creators can insert their own series"
  on public.series for insert with check (
    auth.uid() = creator_id
  );

create policy "Creators can update their own series"
  on public.series for update using (
    auth.uid() = creator_id
  );

create policy "Creators can delete their own series"
  on public.series for delete using (
    auth.uid() = creator_id
  );

-- EPISODES RLS POLICIES
create policy "Premium viewers can watch locked episodes"
  on public.episodes for select using (
    auth.role() = 'authenticated' AND (
      is_premium_locked = false OR
      (select is_premium from public.profiles where id = auth.uid()) = true
    )
  );

create policy "Creators can insert episodes for their series"
  on public.episodes for insert with check (
    exists (
      select 1 from public.series
      where series.id = episodes.series_id
      and series.creator_id = auth.uid()
    )
  );

create policy "Creators can update their own episodes"
  on public.episodes for update using (
    exists (
      select 1 from public.series
      where series.id = episodes.series_id
      and series.creator_id = auth.uid()
    )
  );

create policy "Creators can delete their own episodes"
  on public.episodes for delete using (
    exists (
      select 1 from public.series
      where series.id = episodes.series_id
      and series.creator_id = auth.uid()
    )
  );

-- SUBSCRIPTIONS RLS POLICIES
create policy "Users can view their own subscriptions"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete using (auth.uid() = user_id);

-- LIKES RLS POLICIES
create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Authenticated users can insert likes"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- COMMENTS RLS POLICIES
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can insert comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- FOLLOWS RLS POLICIES
create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Authenticated users can insert follows"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can delete their own follows"
  on public.follows for delete using (auth.uid() = follower_id);

-- Create indexes for performance
create index idx_series_creator on public.series(creator_id);
create index idx_episodes_series on public.episodes(series_id);
create index idx_episodes_premium on public.episodes(is_premium_locked);
create index idx_episodes_mux_asset on public.episodes(mux_asset_id);
create index idx_episodes_processing on public.episodes(processing_status);
create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_likes_episode on public.likes(episode_id);
create index idx_likes_user_episode on public.likes(user_id, episode_id);
create index idx_comments_episode on public.comments(episode_id);
create index idx_comments_user on public.comments(user_id);
create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, role)
  values (
    new.id,
    split_part(new.email, '@', 1),
    split_part(new.email, '@', 1),
    null,
    'viewer'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
