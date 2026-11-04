-- ACDb D1 schema v2: played games and DLCs.
-- Apply via Cloudflare dashboard → Storage & Databases → D1 → acdb → Console,
-- after 0001_init.sql and before deploying the Worker that uses it.
-- Every statement is idempotent, so re-running the whole file is safe.
-- Times are epoch milliseconds.

-- One row per game or DLC (js/games.js ids) a signed-in visitor has marked,
-- synced like items: last edit wins, seq lets a pull ask only for changes.
CREATE TABLE IF NOT EXISTS game_progress (
  sub         TEXT NOT NULL,
  game_id     INTEGER NOT NULL,            -- permanent id from js/games.js (a game or a DLC)
  data        TEXT NOT NULL,               -- JSON: {played, playedDate}
  updated_at  INTEGER NOT NULL,            -- client edit time (skew-corrected)
  seq         INTEGER NOT NULL,            -- users.seq at time of write
  PRIMARY KEY (sub, game_id)
);
CREATE INDEX IF NOT EXISTS game_progress_sub_seq ON game_progress(sub, seq);
