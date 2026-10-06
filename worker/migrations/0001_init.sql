-- ACDb D1 schema v1.
-- Apply via Cloudflare dashboard → Storage & Databases → D1 → acdb → Console.
-- Every statement is idempotent, so re-running the whole file is safe.
-- Times are epoch milliseconds.

CREATE TABLE IF NOT EXISTS users (
  sub           TEXT PRIMARY KEY,          -- Google account id ("sub" claim)
  email         TEXT NOT NULL,
  created_at    INTEGER NOT NULL,
  last_seen_at  INTEGER NOT NULL,
  seq           INTEGER NOT NULL DEFAULT 0 -- bumped once per push batch
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,            -- hex SHA-256 of the bearer token
  sub         TEXT NOT NULL,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_sub ON sessions(sub);

CREATE TABLE IF NOT EXISTS items (
  sub         TEXT NOT NULL,
  item_id     INTEGER NOT NULL,            -- permanent id from database.js
  data        TEXT NOT NULL,               -- JSON: the collection fields
  owned       INTEGER NOT NULL DEFAULT 0,  -- denormalised for profile/leaderboard
  updated_at  INTEGER NOT NULL,            -- client edit time (skew-corrected)
  seq         INTEGER NOT NULL,            -- users.seq at time of write
  PRIMARY KEY (sub, item_id)
);
CREATE INDEX IF NOT EXISTS items_sub_seq ON items(sub, seq);

CREATE TABLE IF NOT EXISTS profiles (
  name_lower         TEXT PRIMARY KEY,
  display_name       TEXT NOT NULL,
  sub                TEXT UNIQUE,          -- set when linked to an account
  legacy_token_hash  TEXT UNIQUE,          -- set for signed-out (token) profiles
  owned_items        TEXT,                 -- JSON array; only for unlinked profiles
  owned_count        INTEGER NOT NULL DEFAULT 0,
  last_updated       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS profiles_owned ON profiles(owned_count DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,          -- e.g. "write:<ip>", "push:<sub>"
  window_start  INTEGER NOT NULL,          -- hour bucket (epoch ms / 3600000)
  count         INTEGER NOT NULL
);
