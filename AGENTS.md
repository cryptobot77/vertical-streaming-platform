<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Base44 sandbox environment

The app runs from `docker-compose.base44.yml` (not the repo's own setup docs, which
assume a hosted Supabase project). That file runs the Next.js dev server from the
bind-mounted source plus a self-contained Supabase-compatible stack, so nothing
external is required to browse the app.

## What's in the stack

| service   | what it is | notes |
|-----------|------------|-------|
| `db`      | `supabase/postgres` — Postgres with Supabase's roles (`anon`, `authenticated`, `service_role`, `authenticator`, `supabase_auth_admin`), extensions and the pre-created `auth` schema + `auth.uid()` / `auth.role()` helpers | data persists in the `db-data` volume |
| `auth`    | `supabase/gotrue` — email/password auth, issues the JWTs PostgREST trusts | `GOTRUE_MAILER_AUTOCONFIRM=true`, so sign-up works with no SMTP |
| `migrate` | one-shot: applies `src/lib/supabase/schema.sql` then `docker/supabase/init/20-seed.sql` | skipped automatically once applied |
| `rest`    | `postgrest` — the `/rest/v1` data API the app's Supabase client uses | built from `docker/postgrest/Dockerfile` |
| `gateway` | `nginx` — routes `/auth/v1` → GoTrue and `/rest/v1` → PostgREST, and answers CORS | published on host port **8000** |
| `web`     | `node:22` running `next dev` on host port **3000** | dependencies install on start; `node_modules` lives in a named volume |

## Non-obvious things

- **Two origins.** The browser-based Supabase client talks to the gateway directly,
  so `NEXT_PUBLIC_SUPABASE_URL` must be a host the browser can reach:
  `https://8000-${BASE44_PUBLIC_HOST_SUFFIX}`. Hence CORS lives in
  `docker/supabase/nginx.conf`, not in the app. `NEXT_PUBLIC_APP_URL` is
  `https://3000-${BASE44_PUBLIC_HOST_SUFFIX}`.
- `next.config.ts` adds the preview host to `allowedDevOrigins` **only** when
  `BASE44_PREVIEW_MODE` is exactly `"1"` (and `BASE44_PUBLIC_HOST_SUFFIX` is set);
  otherwise the option stays empty and behaviour is unchanged.
- `next build`/`next start` are not used here — the dev server is what keeps edits
  visible without a rebuild. `next dev` is bound to `0.0.0.0`.
- `npm ci` needed the lockfile refreshed: `package-lock.json` was missing
  `@emnapi/*` entries, so `npm ci` failed with `EUSAGE` before `npm install`
  synced it.
- Seeding runs **after** GoTrue is healthy, because GoTrue migrates the `auth`
  schema (the image ships an older `auth.users` that GoTrue extends). The
  `handle_new_user` trigger from `schema.sql` also has to exist before any sign-up.
- `episodes` RLS only allows `authenticated` roles to select rows at all, so the
  feed is empty for anonymous visitors — log in with a seeded demo account to see it.
- Seeded demo accounts (password `password123`): `viewer@streamvault.dev`
  (premium viewer) and `creator@streamvault.dev` (owns the seeded series).
- Stripe and Mux are external. `base44-defaults.env` holds clearly-labelled
  placeholders so the app boots; subscription checkout, video upload (which also
  needs Supabase Storage, not included here) and Mux playback only work once real
  values are supplied as app secrets, which are loaded from
  `/run/base44/app.env` *after* the defaults file and therefore win.

## Verifying it works

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps          # everything healthy / migrate exited 0
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/rest/v1/
curl -s -X POST http://localhost:8000/auth/v1/token?grant_type=password \
  -H 'apikey: <anon key>' -H 'Content-Type: application/json' \
  -d '{"email":"viewer@streamvault.dev","password":"password123"}'
```

Note `http://localhost:3000` from the sandbox host reaches Next directly, but the
app's own Supabase calls go out through the public preview host, which the sandbox
can reach (verified).

## Tests

`npm run test:run` (Vitest) and `npm run test:e2e` (Playwright) exist in the repo.
The e2e suite expects a server on port 3000.
