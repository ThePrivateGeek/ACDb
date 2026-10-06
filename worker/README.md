# ACDb Worker — deploy runbook

`acdb-worker.js` is the API behind sharing, the leaderboard and (soon) accounts. It is deployed by hand
from the Cloudflare dashboard: pushing to GitHub does **not** update it. Everything here runs on the
Workers **Free** plan; no payment method is needed. If a screen asks for a card, stop and back out.

## Configuration

| Kind | Name | Value |
|---|---|---|
| D1 binding | `DB` | database `acdb` |
| KV binding | `ACDB` | the existing namespace (original profile store; kept as a backup) |
| Variable | `PROFILES_BACKEND` | `kv` until the migration is done, then `d1` |
| Secret | `ADMIN_KEY` | long random string, used only for `/admin/migrate-kv` |
| Cron trigger | — | `0 3 * * *` (daily cleanup of expired sessions and rate-limit rows) |

Schema files live in `migrations/` and are applied in order in the D1 console. Each one is safe to re-run.

## Deploying code

Workers & Pages → the ACDb worker → **Edit code** → replace everything with the contents of
`acdb-worker.js` → **Deploy**. Changing a variable or binding also needs its own **Deploy**/**Save**
in the settings screen.

## Phase 1 — move profiles from KV to D1 (one time)

1. **Create the database.** Storage & Databases → D1 SQL Database → **Create** → name `acdb` → Create.
2. **Create the tables.** Open `acdb` → **Console** → paste all of `migrations/0001_init.sql` → **Execute**.
   If the console only runs the first statement, run each `CREATE` one at a time. Check:
   ```sql
   SELECT name FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY name;
   ```
   Expected tables: `items`, `profiles`, `rate_limits`, `sessions`, `users`.
3. **Bind it.** Worker → Settings → **Bindings** → Add → D1 database → variable name `DB` → `acdb`.
4. **Variables.** Worker → Settings → **Variables and Secrets** → Add:
   - Text `PROFILES_BACKEND` = `kv`
   - Secret `ADMIN_KEY` = a long random string (for example the output of
     `python3 -c "import secrets; print(secrets.token_hex(32))"`). Keep it somewhere private (not in git).
5. **Cron.** Worker → Settings → **Trigger events / Cron Triggers** → Add → `0 3 * * *`.
6. **Save the current leaderboard** for comparison:
   ```
   curl -s https://api.acdb.workers.dev/leaderboard > leaderboard-before.json
   ```
7. **Deploy the new code** (see above). With `PROFILES_BACKEND=kv` the site behaves exactly as before.
8. **Copy profiles to D1.** Repeat until the response says `"done": true`, passing `nextCursor` each time:
   ```
   curl -s -X POST -H "X-Admin-Key: <ADMIN_KEY>" "https://api.acdb.workers.dev/admin/migrate-kv"
   curl -s -X POST -H "X-Admin-Key: <ADMIN_KEY>" "https://api.acdb.workers.dev/admin/migrate-kv?cursor=<nextCursor>"
   ```
   `broken` counts name keys whose profile data is missing in KV (already unreachable today).
9. **Switch to D1.** Set `PROFILES_BACKEND` = `d1` and deploy, then **immediately run step 8 once more**
   (catches any profile created or updated in between).
10. **Verify.**
    ```
    curl -s https://api.acdb.workers.dev/leaderboard > leaderboard-after.json
    ```
    Compare with `leaderboard-before.json` (same names, counts and order). In the D1 console,
    `SELECT COUNT(*) FROM profiles;` should equal the number of `name:` keys in the KV namespace minus `broken`.
    Then on the site: open a profile, and Share → Update / Delete with a throwaway profile.

**Rollback:** set `PROFILES_BACKEND` back to `kv` and deploy. KV is never written in `d1` mode, so it still
holds every profile as it was at the switch (profiles created after the switch exist only in D1).

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
