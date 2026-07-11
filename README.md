# Vertical Streaming Platform

A premium vertical video streaming platform MVP built with Next.js 15+, Supabase, Mux, and Stripe. Features mobile-first infinite video feed, premium content locking, creator dashboard, and subscription management.

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Video Infrastructure**: Mux Video API for HLS streaming
- **Payment Processing**: Stripe for subscriptions
- **State Management**: Zustand
- **Video Player**: Custom React component with Intersection Observer

## Features

- **Mobile-First Infinite Video Feed**: TikTok-style vertical video scrolling with auto-play/pause
- **Premium Content System**: Row-Level Security (RLS) for premium episode access
- **Authentication**: Email/password and OAuth (GitHub, Google) via Supabase Auth
- **Creator Dashboard**: Series and episode management with video upload
- **Subscription Management**: Stripe integration for premium subscriptions
- **Responsive Design**: Mobile-optimized with desktop support

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── (feed)/
│   │   ├── page.tsx            # Infinite video feed
│   │   └── series/[id]/page.tsx # Series detail page
│   ├── (dashboard)/
│   │   └── creator/
│   │       ├── page.tsx        # Creator dashboard
│   │       └── upload/page.tsx # Upload series/episodes
│   └── api/
│       └── webhooks/
│           └── stripe/route.ts # Stripe webhook handler
├── components/
│   └── VideoPlayer.tsx         # Video player component
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── schema.sql          # Database schema
│   ├── mux.ts                  # Mux API utilities
│   └── store.ts                # Zustand stores
└── middleware.ts               # Auth middleware
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Mux Configuration
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
NEXT_PUBLIC_MUX_ENV_KEY=your_mux_environment_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the schema from `src/lib/supabase/schema.sql`
4. Enable the following providers in Authentication:
   - Email
   - GitHub (create OAuth app)
   - Google (create OAuth app)
5. Create a storage bucket named `videos` with public access

### 3. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Create a product with a recurring price for premium subscriptions
3. Set up a webhook endpoint at `https://your-domain.com/api/webhooks/stripe`
4. Configure webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Mux Setup

1. Create a Mux account at [mux.com](https://mux.com)
2. Generate API tokens in your Mux dashboard
3. Configure CORS settings to allow your domain

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles linked to Supabase Auth
- **series**: Content series created by creators
- **episodes**: Individual video episodes with premium locking
- **subscriptions**: User subscription status and Stripe integration

All tables are protected with Row-Level Security (RLS) policies.

## Key Features Implementation

### Video Feed

The infinite video feed uses React Intersection Observer to:
- Auto-play videos when they occupy >80% of viewport
- Pause background videos to save bandwidth
- Handle mobile touch gestures for scrolling

### Premium Content

Premium episodes are protected at the database level:
- RLS policies check user's premium status
- Non-premium users see lock prompts
- Stripe webhooks update premium status automatically

### Video Upload

Creators can upload videos through:
- Direct upload to Supabase Storage (development)
- Mux integration for HLS transcoding (production)
- Automatic episode numbering within series

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Production

1. Update environment variables with production Supabase URL
2. Enable additional security features in Supabase
3. Configure proper CORS settings
4. Set up database backups

## Monetization Strategy

The platform supports two monetization models:

1. **Netflix Model**: Global premium subscription for all content
2. **Micro-transaction Model**: Premium credits to unlock individual episodes

Current implementation uses the Netflix model with Stripe subscriptions.

## Development Roadmap

- [ ] Add real-time chat for flagship series launches
- [ ] Implement video analytics and engagement metrics
- [ ] Add recommendation algorithm for personalized feed
- [ ] Create mobile app (React Native)
- [ ] Implement creator revenue splitting
- [ ] Add content moderation tools
- [ ] Enable live streaming capabilities

## Contributing

This is an MVP project. Contributions welcome for:
- UI/UX improvements
- Performance optimizations
- Additional features
- Bug fixes

## License

Proprietary - All rights reserved
