-- Development seed data for the Base44 sandbox preview.
-- Applied once by docker/supabase/migrate.sh (skipped when series rows exist).
--
-- Demo logins (password: password123)
--   viewer@streamvault.dev   premium viewer
--   creator@streamvault.dev  creator, owns the "Ava Reyes" series
--
-- Sample videos are public MP4s (no Mux account needed) stored in
-- hls_playback_url, which is the field the feed passes to the player.

set search_path = extensions, public, auth;

-- 1. Auth users --------------------------------------------------------------
-- The token columns below are NULLable in this image's hand-written auth schema,
-- but GoTrue scans them as plain strings, so rows must carry '' rather than NULL.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
) values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'creator@streamvault.dev',
   extensions.crypt('password123', extensions.gen_salt('bf')), now(),
   '', '', '', '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Ava Reyes"}', now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'nova@streamvault.dev',
   null, now(),
   '', '', '', '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Nova Lund"}', now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'kai@streamvault.dev',
   null, now(),
   '', '', '', '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Kai Tanaka"}', now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'viewer@streamvault.dev',
   extensions.crypt('password123', extensions.gen_salt('bf')), now(),
   '', '', '', '', '', '', '', '',
   '{"provider":"email","providers":["email"]}', '{"display_name":"Demo Viewer"}', now(), now(), false, false)
on conflict (id) do nothing;

-- 2. Email identities --------------------------------------------------------
insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users u
where u.email like '%@streamvault.dev'
on conflict (provider_id, provider) do nothing;

-- 3. Profiles (rows are created by the handle_new_user trigger) --------------
update public.profiles p
set display_name = v.display_name,
    avatar_url   = v.avatar_url,
    role         = v.role,
    is_premium   = v.is_premium
from (values
  ('a0000000-0000-4000-8000-000000000001', 'Ava Reyes',   'https://picsum.photos/seed/ava-avatar/160/160',   'creator', false),
  ('a0000000-0000-4000-8000-000000000002', 'Nova Lund',   'https://picsum.photos/seed/nova-avatar/160/160',  'creator', false),
  ('a0000000-0000-4000-8000-000000000003', 'Kai Tanaka',  'https://picsum.photos/seed/kai-avatar/160/160',   'creator', false),
  ('b0000000-0000-4000-8000-000000000001', 'Demo Viewer', 'https://picsum.photos/seed/viewer-avatar/160/160','viewer',  true)
) as v(id, display_name, avatar_url, role, is_premium)
where p.id = v.id::uuid;

-- 4. Active subscription for the demo viewer ---------------------------------
insert into public.subscriptions (id, user_id, stripe_subscription_id, status, price_id, current_period_end)
values ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
        'sub_seed_demo', 'active', 'price_seed_monthly', now() + interval '30 days')
on conflict (id) do nothing;

-- 5. Series ------------------------------------------------------------------
insert into public.series (id, creator_id, title, description, cover_image_url, is_flagship, created_at) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Neon Nights',
   'Rain-slicked streets, midnight races and a city that never switches off.', 'https://picsum.photos/seed/neon-nights/600/900', true,  now() - interval '9 days'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Midnight Kitchen',
   'A one-pan supper club that only opens when the rest of the world is asleep.', 'https://picsum.photos/seed/midnight-kitchen/600/900', false, now() - interval '7 days'),
  ('c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Signal Lost',
   'A shortwave mystery told in six transmissions from the edge of the map.', 'https://picsum.photos/seed/signal-lost/600/900', false, now() - interval '5 days'),
  ('c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Aurora Drift',
   'Chasing the northern lights across ice roads and empty highways.', 'https://picsum.photos/seed/aurora-drift/600/900', true, now() - interval '4 days'),
  ('c0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'Static Bloom',
   'Macro filmmaking: what flowers do when nobody is watching.', 'https://picsum.photos/seed/static-bloom/600/900', false, now() - interval '3 days'),
  ('c0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'Iron Coast',
   'Shipbreakers, salt air and the last working yards on the north shore.', 'https://picsum.photos/seed/iron-coast/600/900', true, now() - interval '2 days')
on conflict (id) do nothing;

-- 6. Episodes ----------------------------------------------------------------
insert into public.episodes (id, series_id, title, description, episode_number, hls_playback_url, source_video_url, mux_asset_id, processing_status, duration_seconds, is_premium_locked, created_at) values
  ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Enter the Glow', 'The first lap decides everything.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', null, null, 'ready', 15, false, now() - interval '9 days'),
  ('e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Chrome Hearts', 'A tune-up turns into a wager.', 2,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', null, null, 'ready', 15, true, now() - interval '8 days'),
  ('e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'Blackout', 'The grid goes down mid-race.', 3,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', null, null, 'ready', 15, true, now() - interval '8 days'),
  ('e0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'Oil & Salt', 'Everything starts with a hot pan.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', null, null, 'ready', 15, false, now() - interval '7 days'),
  ('e0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000002', 'Fire Service', 'Dinner for twelve, one burner.', 2,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', null, null, 'ready', 15, true, now() - interval '6 days'),
  ('e0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003', 'Static', 'The first transmission arrives.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', null, null, 'ready', 15, false, now() - interval '5 days'),
  ('e0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000003', 'Dead Air', 'Nobody answers the call sign.', 2,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', null, null, 'ready', 15, true, now() - interval '4 days'),
  ('e0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000004', 'First Light', 'Leaving town before the sun does.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', null, null, 'ready', 15, false, now() - interval '4 days'),
  ('e0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000004', 'Solar Wind', 'The forecast says clear skies. It lies.', 2,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', null, null, 'ready', 15, true, now() - interval '3 days'),
  ('e0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000005', 'Petal Fall', 'One flower, ninety seconds, no cuts.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', null, null, 'ready', 15, true, now() - interval '3 days'),
  ('e0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000006', 'Cold Open', 'The yard wakes up at four.', 1,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', null, null, 'ready', 15, false, now() - interval '2 days'),
  ('e0000000-0000-4000-8000-000000000012', 'c0000000-0000-4000-8000-000000000006', 'Undertow', 'What the tide brings back.', 2,
   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', null, null, 'ready', 15, true, now() - interval '1 day')
on conflict (id) do nothing;

-- 7. A little social activity so counts and follow buttons have something -----
insert into public.likes (user_id, episode_id, created_at) values
  ('b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', now() - interval '6 days'),
  ('b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000006', now() - interval '5 days'),
  ('a0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', now() - interval '5 days'),
  ('a0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000004', now() - interval '4 days')
on conflict (user_id, episode_id) do nothing;

insert into public.comments (id, user_id, episode_id, content, created_at) values
  ('f0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'That opening shot though.', now() - interval '6 days'),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 'Watched it three times.', now() - interval '5 days'),
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'e0000000-0000-4000-8000-000000000006', 'Genuinely unsettling. More please.', now() - interval '4 days')
on conflict (id) do nothing;

insert into public.follows (follower_id, following_id, created_at) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', now() - interval '7 days'),
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', now() - interval '7 days')
on conflict (follower_id, following_id) do nothing;
