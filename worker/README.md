# ACDb Worker — deploy runbook

`acdb-worker.js` is the API behind sharing, the leaderboard, accounts and sync. It is deployed by hand
from the Cloudflare dashboard: pushing to GitHub does **not** update it. Everything here runs on the
Workers **Free** plan; no payment method is needed. If a screen asks for a card, stop and back out.

## Configuration

| Kind | Name | Value |
|---|---|---|
| D1 binding | `DB` | database `acdb` |
| KV binding | `ACDB` | the pre-D1 profile store; no longer read, kept as a frozen backup (see Cleanup) |
| Variable | `GOOGLE_CLIENT_ID` | OAuth client id (see Google Cloud below) |
| Secret | `GOOGLE_CLIENT_SECRET` | that client's secret |
| Cron trigger | — | `0 3 * * *` (daily cleanup of expired sessions and rate-limit rows) |

Schema files live in `migrations/` and are applied in order in the D1 console. Each one is safe to re-run.

## Deploying code

Workers & Pages → the ACDb worker → **Edit code** → replace everything with the contents of
`acdb-worker.js` → **Deploy**. Changing a variable or binding also needs its own **Deploy**/**Save**
in the settings screen.

## Phase 1 — D1 database (one time)

1. **Create the database.** Storage & Databases → D1 SQL Database → **Create** → name `acdb` → Create.
2. **Create the tables.** Open `acdb` → **Console** → paste all of `migrations/0001_init.sql` → **Execute**.
   If the console only runs the first statement, run each `CREATE` one at a time. Check:
   ```sql
   SELECT name FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY name;
   ```
   Expected tables: `items`, `profiles`, `rate_limits`, `sessions`, `users`.
3. **Bind it.** Worker → Settings → **Bindings** → Add → D1 database → variable name `DB` → `acdb`.
4. **Cron.** Worker → Settings → **Trigger events / Cron Triggers** → Add → `0 3 * * *`.

Profiles were copied from KV to D1 on 2026-10-06 with a one-time `/admin/migrate-kv` endpoint, removed in
the 2026-10-13 cleanup (it is in git history if ever needed again).

## Phases 2, 3 and 6 — Google sign-in, sync API, linked profiles

The code is safe to deploy before the Google setup is finished: without the two Google variables,
`/auth/google` answers 503 and nothing else changes. No new tables are needed (`0001_init.sql` already has them).

### A. Google Cloud (one time, free, no billing account)

Ignore any "Start free trial" / "Activate" banner: that is the only part that asks for a card.

1. <https://console.cloud.google.com> → project picker (top left) → **New project** → name `ACDb` → Create,
   then make sure `ACDb` is the selected project.
2. Menu → **Google Auth Platform** (also reachable as APIs & Services → OAuth consent screen) → **Get started**:
   - App name `ACDb`, user support email `info@theprivategeek.com` (or your Gmail)
   - Audience **External**
   - Contact email: yours → agree → **Create**
3. **Branding**:
   - Application home page `https://acdb.theprivategeek.com/`
   - Privacy policy `https://acdb.theprivategeek.com/privacy.html` (goes live in Phase 7; fine while in Testing)
   - Authorized domains: `theprivategeek.com`
   - **Don't upload a logo** (a logo triggers Google's brand review) → Save
4. **Data Access** → Add or remove scopes → tick `openid` and `.../auth/userinfo.email` → Update → Save.
5. **Audience** → leave Publishing status on **Testing** for now → Test users → **Add users** → your Gmail
   (and anyone else who will test). Only test users can sign in until the app is published at launch.
6. **Clients** → **Create client** → Application type **Web application** → name `ACDb web` →
   **Authorized redirect URIs** → add all three (the trailing slash matters):
   - `https://acdb.theprivategeek.com/`
   - `http://localhost:8000/`
   - `http://127.0.0.1:8000/`

   No "Authorized JavaScript origins" are needed. **Create**, then **copy the Client secret right away**:
   Google only shows it in full at creation (or download the JSON). Keep it out of git and chat.

### B. Cloudflare

1. Worker → Settings → Variables and Secrets → Add:
   - Text `GOOGLE_CLIENT_ID` = the client id (ends in `.apps.googleusercontent.com`)
   - Secret `GOOGLE_CLIENT_SECRET` = the client secret
2. Deploy the new `acdb-worker.js` (Edit code → replace all → Deploy).
3. Smoke test:
   ```
   curl.exe -s https://api.acdb.workers.dev/me
   ```
   → `{"error":"Please sign in again.","code":"session_expired"}`
   ```
   curl.exe -s -X POST https://api.acdb.workers.dev/auth/google -H "Content-Type: application/json" -d "{}"
   ```
   → `{"error":"Invalid sign-in request."}` (a 503 "not configured" means the Google variables are missing).
   The leaderboard and profiles should look exactly as before.

The full sign-in round trip is tested from the site itself once the client code (Phase 4) is in.

## Launch (Phase 7)

1. Google Auth Platform → **Audience** → **Publish app** → confirm. Status becomes "In production", so any
   Google account can sign in (no verification needed: the app only asks for `openid` and email).
2. Merge `feature/cloud-sync` into `main` and push. GitHub Pages publishes the site within a minute or two.
3. Check on the live site: sign in with an account that is **not** a test user; `privacy.html` loads.

## Cleanup after the move to D1

Done 2026-10-13, one week after the switch:

1. `acdb-worker.js` no longer has the KV profile store, the `PROFILES_BACKEND` switch or `/admin/migrate-kv`.
2. The `PROFILES_BACKEND` variable and the `ADMIN_KEY` secret were removed from the Worker settings
   (after the new code was deployed: the old code fell back to KV when the variable was missing).

Still to do, a few weeks later (around mid-November 2026): delete the KV backup. It is a frozen copy of the
profiles as of 2026-10-06 and its keys are the raw edit tokens of signed-out profiles, so it should not be
kept indefinitely. Worker → Settings → **Bindings** → remove `ACDB` → Deploy, then Storage & Databases →
KV → the namespace → **Delete**. Deleting it cannot be undone.
