// ACDb - Cloudflare Worker API
// Public profiles and the leaderboard, Google sign-in, and collection sync
//
// Bindings (dashboard → Worker → Settings → Bindings):
//   DB    D1 database "acdb" (schema: worker/migrations/)
//   ACDB  KV namespace: the pre-D1 profile store, no longer read. Kept for now
//         as a frozen backup; it holds raw edit tokens, so delete it in time.
// Variables and secrets (dashboard → Worker → Settings → Variables and Secrets):
//   GOOGLE_CLIENT_ID      text: OAuth client id (Google Cloud → Credentials)
//   GOOGLE_CLIENT_SECRET  secret: that client's secret
// Cron trigger: daily (e.g. "0 3 * * *") cleans up expired rows.
// See worker/README.md for the deploy runbook.

// Sent on every response as the ACDb-Worker header, so the live version can
// be checked with curl. Change it with every deploy.
const WORKER_VERSION = '2026-11-02';

const SITE_URL = 'https://acdb.theprivategeek.com';
const ALLOWED_ORIGINS = [
  SITE_URL,
  'http://localhost:8000',   // python3 -m http.server 8000 (local dev)
  'http://127.0.0.1:8000',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : SITE_URL,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
    'ACDb-Worker': WORKER_VERSION
  };
}

// Thrown to answer with an error status; the fetch handler turns it into JSON.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Handle CORS preflight
function handleOptions(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// JSON response helper
function json(request, data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(request), ...extraHeaders }
  });
}

// Request bodies are small except a sync push: 200 changes with 5000-character
// notes stay well under the larger limit even when every character is escaped.
const MAX_BODY_BYTES = 64 * 1024;
const MAX_PUSH_BODY_BYTES = 8 * 1024 * 1024;

// Parse a JSON request body; null when it is missing or malformed.
// Only application/json is accepted: another site can make a browser send that
// only after a CORS preflight, which only the site's own origins pass. A body
// over maxBytes is refused without reading the rest of it.
async function readJson(request, maxBytes = MAX_BODY_BYTES) {
  const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') throw new HttpError(415, 'Send the request body as application/json.');
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw new HttpError(413, 'Request body is too large.');
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, 'Request body is too large.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

// Generate a random token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

// Validate display name: 5-25 chars, alphanumeric + hyphens + underscores
function isValidName(name) {
  return /^[a-zA-Z0-9_-]{5,25}$/.test(name);
}

// Item ids. Anything up to MAX_ITEM_ID is stored, but only ids up to
// CATALOG_MAX_ID count towards a profile's owned total, so made-up ids can't
// lift anyone up the leaderboard. Keep CATALOG_MAX_ID a little above the
// highest id in js/database.js: tools/validate-catalog.py warns when the
// catalog gets close. Raising it needs a Worker deploy.
const CATALOG_MAX_ID = 800;
const MAX_ITEM_ID = 100000;
const ITEM_ID_FORMAT = /^[1-9]\d{0,5}$/;

// Owned items of a token-owned profile: item ids sent as strings. Duplicates
// are dropped. Returns { items, count } or { error }.
const MAX_OWNED_ITEMS = 2000;
function parseOwnedItems(ownedItems) {
  if (!Array.isArray(ownedItems)) return { error: 'ownedItems must be an array.' };
  if (ownedItems.length > MAX_OWNED_ITEMS) return { error: `ownedItems exceeds maximum of ${MAX_OWNED_ITEMS}.` };
  const ids = new Set();
  for (const ref of ownedItems) {
    if (typeof ref !== 'string' || !ITEM_ID_FORMAT.test(ref) || Number(ref) > MAX_ITEM_ID) {
      return { error: 'ownedItems must contain item ids.' };
    }
    ids.add(ref);
  }
  const items = [...ids];
  return { items, count: items.filter(ref => Number(ref) <= CATALOG_MAX_ID).length };
}

// The owned total of a profile linked to account ?1, for use inside a query.
// CATALOG_MAX_ID is a number constant, so writing it into the SQL is safe.
const LINKED_OWNED_COUNT = `(SELECT COUNT(*) FROM items WHERE sub = ?1 AND owned = 1 AND item_id <= ${CATALOG_MAX_ID})`;

// ---- Accounts: sign-in with Google and sessions ----
// The site sends the user to Google's consent screen (OAuth 2.0 authorization
// code flow with PKCE) and posts the returned code here. The Worker trades it
// for an ID token, then hands the browser its own opaque session token. D1
// keeps only the token's SHA-256 hash.
const SESSION_TTL = 180 * 24 * 3600 * 1000;
const SESSION_EXTEND_BELOW = 150 * 24 * 3600 * 1000;   // slide at most once per ~30 days
const REDIRECT_URIS = ALLOWED_ORIGINS.map(origin => origin + '/');
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

function bearerToken(request) {
  const header = request.headers.get('Authorization') || '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
}

function decodeJwtPayload(jwt) {
  const part = String(jwt).split('.')[1] || '';
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function sessionExpired(request) {
  return json(request, { error: 'Please sign in again.', code: 'session_expired' }, 401);
}

// Resolve the Bearer session to its account, sliding the expiry forward when
// it is getting old. Returns { sub, email } or null.
async function authenticate(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT s.sub, s.expires_at, u.email FROM sessions s JOIN users u ON u.sub = s.sub
     WHERE s.token_hash = ?`
  ).bind(tokenHash).first();
  const now = Date.now();
  if (!row || row.expires_at < now) return null;
  if (row.expires_at - now < SESSION_EXTEND_BELOW) {
    await env.DB.batch([
      env.DB.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').bind(now + SESSION_TTL, tokenHash),
      env.DB.prepare('UPDATE users SET last_seen_at = ? WHERE sub = ?').bind(now, row.sub)
    ]);
  }
  return { sub: row.sub, email: row.email };
}

async function shareFor(env, sub) {
  const row = await env.DB.prepare('SELECT display_name FROM profiles WHERE sub = ?').bind(sub).first();
  return row ? { displayName: row.display_name } : null;
}

// ---- Rate limiting ----
// Fixed one-hour window per key, counted in D1: one row write per allowed
// request, none once the key is over its limit. Each Worker instance also
// remembers the counts it has seen, so a key it already knows is over the
// limit is turned away without touching D1.
function hourBucket(ms) {
  return Math.floor(ms / 3600000);
}

const recentCounts = new Map();   // key -> { window, count }, this instance only
const MAX_RECENT_COUNTS = 10000;

function rememberCount(key, window, count) {
  if (recentCounts.size >= MAX_RECENT_COUNTS && !recentCounts.has(key)) {
    for (const [k, seen] of recentCounts) if (seen.window !== window) recentCounts.delete(k);
    if (recentCounts.size >= MAX_RECENT_COUNTS) recentCounts.clear();
  }
  recentCounts.set(key, { window, count });
}

async function checkRateLimit(env, key, limit) {
  const window = hourBucket(Date.now());
  const seen = recentCounts.get(key);
  if (seen && seen.window === window && seen.count >= limit) return false;

  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
       window_start = excluded.window_start
     WHERE rate_limits.window_start <> excluded.window_start OR rate_limits.count < ?3
     RETURNING count`
  ).bind(key, window, limit).first();
  // No row back: the window is already full, so nothing was written.
  rememberCount(key, window, row ? row.count : limit);
  return !!row;
}

// Public reads (profiles, name checks) are limited in memory only, per Worker
// instance: a D1 counter would cost a write for every read it protects.
const READ_LIMIT = 600;   // per IP per hour

function checkReadLimit(ip) {
  const key = `read:${ip}`;
  const window = hourBucket(Date.now());
  const seen = recentCounts.get(key);
  const count = seen && seen.window === window ? seen.count + 1 : 1;
  if (count > READ_LIMIT) return false;
  rememberCount(key, window, count);
  return true;
}

// ---- Profile store ----
// Times are epoch ms in and ISO strings out (the API's lastUpdated format).
// D1 keeps only a SHA-256 hash of each profile's edit token.

// Each Worker instance keeps the leaderboard for a minute (browsers cache it
// for as long) and drops it when it changes a profile itself.
const LEADERBOARD_SIZE = 100;
const LEADERBOARD_TTL = 60 * 1000;
let leaderboardCache = null;   // { at, profiles }

function profilesChanged() {
  leaderboardCache = null;
}

const d1Profiles = {
  async nameExists(env, nameLower) {
    return !!(await env.DB.prepare('SELECT 1 FROM profiles WHERE name_lower = ?')
      .bind(nameLower).first());
  },

  // Returns false when the name is already taken.
  async create(env, { nameLower, displayName, token, owned, now }) {
    const result = await env.DB.prepare(
      `INSERT INTO profiles (name_lower, display_name, legacy_token_hash, owned_items, owned_count, last_updated)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`
    ).bind(nameLower, displayName, await sha256Hex(token), JSON.stringify(owned.items), owned.count, now).run();
    if (result.meta.changes !== 1) return false;
    profilesChanged();
    return true;
  },

  // Returns false when no profile has this token.
  async updateByToken(env, token, owned, now) {
    const result = await env.DB.prepare(
      'UPDATE profiles SET owned_items = ?, owned_count = ?, last_updated = ? WHERE legacy_token_hash = ?'
    ).bind(JSON.stringify(owned.items), owned.count, now, await sha256Hex(token)).run();
    if (result.meta.changes !== 1) return false;
    profilesChanged();
    return true;
  },

  async getByName(env, nameLower) {
    const row = await env.DB.prepare(
      'SELECT display_name, sub, owned_items, owned_count, last_updated FROM profiles WHERE name_lower = ?'
    ).bind(nameLower).first();
    if (!row) return null;
    let ownedItems;
    if (row.sub === null) {
      ownedItems = JSON.parse(row.owned_items || '[]');
    } else {
      // Linked to an account: read straight from the synced collection.
      const { results } = await env.DB.prepare(
        'SELECT item_id FROM items WHERE sub = ? AND owned = 1 ORDER BY item_id'
      ).bind(row.sub).all();
      ownedItems = results.map(r => String(r.item_id));
    }
    return {
      displayName: row.display_name,
      ownedItems,
      ownedCount: row.owned_count,
      lastUpdated: new Date(row.last_updated).toISOString()
    };
  },

  // The top LEADERBOARD_SIZE profiles
  async leaderboard(env) {
    // Ties break alphabetically, the order the old KV store listed them in
    const { results } = await env.DB.prepare(
      'SELECT display_name, owned_count, last_updated FROM profiles ORDER BY owned_count DESC, name_lower LIMIT ?'
    ).bind(LEADERBOARD_SIZE).all();
    return results.map(row => ({
      displayName: row.display_name,
      ownedCount: row.owned_count,
      lastUpdated: new Date(row.last_updated).toISOString()
    }));
  },

  // Returns false when no profile has this token.
  async deleteByToken(env, token) {
    const result = await env.DB.prepare('DELETE FROM profiles WHERE legacy_token_hash = ?')
      .bind(await sha256Hex(token)).run();
    if (result.meta.changes !== 1) return false;
    profilesChanged();
    return true;
  }
};

// ---- Route handlers ----

// POST /share - Create a new shared profile. Signed out: a token-owned
// snapshot of ownedItems. Signed in (Bearer session): a profile linked to the
// account, which follows the synced collection and ignores ownedItems.
// Requests are checked before the rate limit, so invalid ones cost no D1 write.
async function handleShare(request, env, ip) {
  const body = await readJson(request);
  if (!body) return json(request, { error: 'Invalid JSON body.' }, 400);
  const { displayName, ownedItems } = body;

  if (!displayName || !isValidName(displayName)) {
    return json(request, { error: 'Display name must be 5-25 characters (letters, numbers, hyphens, underscores).' }, 400);
  }

  const linked = !!bearerToken(request);
  const owned = linked ? null : parseOwnedItems(ownedItems);
  if (owned && owned.error) return json(request, { error: owned.error }, 400);

  if (!(await checkRateLimit(env, `write:${ip}`, 10))) {
    return json(request, { error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  if (linked) return createLinkedProfile(request, env, displayName);

  const nameLower = displayName.toLowerCase();
  const token = generateToken();
  const created = await d1Profiles.create(env, { nameLower, displayName, token, owned, now: Date.now() });
  if (!created) {
    return json(request, { error: 'Display name is already taken.' }, 409);
  }

  return json(request, { success: true, token, displayName, shareUrl: `${SITE_URL}/#profile/${nameLower}` });
}

// PUT /update - Update an existing shared profile
async function handleUpdate(request, env, ip) {
  const authToken = request.headers.get('Authorization');
  if (!authToken) {
    return json(request, { error: 'Missing authorization token.' }, 401);
  }
  if (bearerToken(request)) {
    return json(request, { error: 'Profiles linked to an account update automatically.' }, 400);
  }

  const body = await readJson(request);
  if (!body) return json(request, { error: 'Invalid JSON body.' }, 400);
  const owned = parseOwnedItems(body.ownedItems);
  if (owned.error) return json(request, { error: owned.error }, 400);

  if (!(await checkRateLimit(env, `write:${ip}`, 10))) {
    return json(request, { error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  const now = Date.now();
  const updated = await d1Profiles.updateByToken(env, authToken, owned, now);
  if (!updated) {
    return json(request, { error: 'Profile not found. Token may be invalid.' }, 404);
  }

  return json(request, { success: true, ownedCount: owned.count, lastUpdated: new Date(now).toISOString() });
}

// GET /profile/:name - View a public profile
async function handleGetProfile(request, env, path, ip) {
  if (!checkReadLimit(ip)) return json(request, { error: 'Too many requests. Try again later.' }, 429);
  const nameLower = path.replace('/profile/', '').toLowerCase();
  const profile = isValidName(nameLower) ? await d1Profiles.getByName(env, nameLower) : null;
  if (!profile) {
    return json(request, { error: 'Profile not found.' }, 404);
  }
  // Public data only (never the token)
  return json(request, profile);
}

// GET /leaderboard - The top profiles by owned count
async function handleLeaderboard(request, env) {
  const now = Date.now();
  if (!leaderboardCache || now - leaderboardCache.at >= LEADERBOARD_TTL) {
    leaderboardCache = { at: now, profiles: await d1Profiles.leaderboard(env) };
  }
  return json(request, { profiles: leaderboardCache.profiles }, 200, { 'Cache-Control': 'public, max-age=60' });
}

// GET /check-name/:name - Check if a display name is available
async function handleCheckName(request, env, path, ip) {
  if (!checkReadLimit(ip)) return json(request, { error: 'Too many requests. Try again later.' }, 429);
  const nameLower = path.replace('/check-name/', '').toLowerCase();
  if (!isValidName(nameLower)) {
    return json(request, { available: false, error: 'Invalid name format.' });
  }
  const taken = await d1Profiles.nameExists(env, nameLower);
  return json(request, { available: !taken });
}

// DELETE /profile - Delete own profile
async function handleDeleteProfile(request, env) {
  const authToken = request.headers.get('Authorization');
  if (!authToken) {
    return json(request, { error: 'Missing authorization token.' }, 401);
  }

  if (bearerToken(request)) {
    const user = await authenticate(request, env);
    if (!user) return sessionExpired(request);
    const result = await env.DB.prepare('DELETE FROM profiles WHERE sub = ?').bind(user.sub).run();
    if (result.meta.changes === 0) return json(request, { error: 'Profile not found.' }, 404);
    profilesChanged();
    return json(request, { success: true, message: 'Profile deleted.' });
  }

  const deleted = await d1Profiles.deleteByToken(env, authToken);
  if (!deleted) {
    return json(request, { error: 'Profile not found.' }, 404);
  }

  return json(request, { success: true, message: 'Profile deleted.' });
}

// ---- Account routes ----

// POST /auth/google {code, codeVerifier, redirectUri} - finish Google sign-in
async function handleGoogleAuth(request, env, ip) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return json(request, { error: 'Sign-in is not configured.' }, 503);
  }
  const body = await readJson(request);
  const { code, codeVerifier, redirectUri } = body || {};
  if (typeof code !== 'string' || code.length === 0 || code.length > 2048
      || typeof codeVerifier !== 'string' || !/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)
      || !REDIRECT_URIS.includes(redirectUri)) {
    return json(request, { error: 'Invalid sign-in request.' }, 400);
  }
  if (!(await checkRateLimit(env, `auth:${ip}`, 20))) {
    return json(request, { error: 'Too many sign-in attempts. Try again later.' }, 429);
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      grant_type: 'authorization_code'
    })
  });
  if (!tokenRes.ok) {
    console.error('Google token exchange failed', tokenRes.status, await tokenRes.text());
    return json(request, { error: 'Google sign-in failed. Please try again.', code: 'google_rejected' }, 401);
  }

  // The ID token came straight from Google's token endpoint over TLS, so per
  // OpenID Connect Core 3.1.3.7 its claims are validated but not its signature.
  const { id_token: idToken } = await tokenRes.json();
  let claims;
  try {
    claims = decodeJwtPayload(idToken);
  } catch {
    claims = null;
  }
  const now = Date.now();
  if (!claims || claims.aud !== env.GOOGLE_CLIENT_ID || !GOOGLE_ISSUERS.includes(claims.iss)
      || !(claims.exp * 1000 > now) || typeof claims.sub !== 'string' || typeof claims.email !== 'string') {
    return json(request, { error: 'Google sign-in failed. Please try again.', code: 'google_rejected' }, 401);
  }

  const session = generateToken();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users (sub, email, created_at, last_seen_at) VALUES (?1, ?2, ?3, ?3)
       ON CONFLICT(sub) DO UPDATE SET email = excluded.email, last_seen_at = excluded.last_seen_at`
    ).bind(claims.sub, claims.email, now),
    env.DB.prepare('INSERT INTO sessions (token_hash, sub, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(await sha256Hex(session), claims.sub, now, now + SESSION_TTL)
  ]);

  return json(request, {
    session,
    account: { id: claims.sub, email: claims.email },
    share: await shareFor(env, claims.sub),
    serverTime: now
  });
}

// GET /me - who is signed in
async function handleMe(request, env) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);
  return json(request, {
    account: { id: user.sub, email: user.email },
    share: await shareFor(env, user.sub),
    serverTime: Date.now()
  });
}

// POST /auth/logout - end this device's session
async function handleLogout(request, env) {
  const token = bearerToken(request);
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  }
  return json(request, { success: true });
}

// ---- Collection sync ----
// Last writer wins per item, by the client's (skew-corrected) edit time.
// Each push bumps users.seq and stamps the rows it changed with it, so a
// pull only has to ask for rows with seq > the cursor it last saw.
const MAX_CHANGES_PER_PUSH = 200;
const MAX_ROWS_PER_USER = 5000;
const MAX_NOTES_LENGTH = 5000;
const MAX_FUTURE_SKEW = 5 * 60 * 1000;
const CONDITIONS = new Set(['', 'mint', 'near-mint', 'excellent', 'good', 'fair', 'poor']);

// Coerce to the 10 known fields; unknown keys are dropped. Structural problems
// reject the whole request, field-level junk is coerced, so a client is never
// stuck retrying a batch it cannot fix.
function sanitizeItemData(d) {
  const str = (v, max) => (typeof v === 'string' && v.length <= max ? v : '');
  return {
    owned: d.owned === true,
    wishlist: d.wishlist === true,
    hasBox: d.hasBox === true,
    condition: CONDITIONS.has(d.condition) ? d.condition : '',
    copies: Number.isInteger(d.copies) ? Math.min(Math.max(d.copies, 0), 999) : 0,
    pricePaid: str(d.pricePaid, 20),
    acquiredDate: /^\d{4}-\d{2}-\d{2}$/.test(d.acquiredDate) ? d.acquiredDate : '',
    notes: str(d.notes, MAX_NOTES_LENGTH),
    hasRead: d.hasRead === true,
    readDate: /^\d{4}-\d{2}-\d{2}$/.test(d.readDate) ? d.readDate : ''
  };
}

// GET /collection?since=<cursor> - rows changed after the cursor
async function handleGetCollection(request, env, url) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  const read = since => env.DB.batch([
    env.DB.prepare('SELECT seq FROM users WHERE sub = ?').bind(user.sub),
    env.DB.prepare('SELECT item_id, data, updated_at FROM items WHERE sub = ? AND seq > ? ORDER BY seq')
      .bind(user.sub, since)
  ]);

  let since = Math.max(0, parseInt(url.searchParams.get('since'), 10) || 0);
  let [seqResult, itemsResult] = await read(since);
  const cursor = seqResult.results[0].seq;
  if (since > cursor) {
    // Cursor from before the account was deleted and recreated: start over.
    since = 0;
    [seqResult, itemsResult] = await read(0);
  }

  return json(request, {
    cursor: seqResult.results[0].seq,
    full: since === 0,
    items: itemsResult.results.map(row => ({ id: row.item_id, data: JSON.parse(row.data), updatedAt: row.updated_at })),
    serverTime: Date.now()
  });
}

// PUT /collection {changes: [{id, data, updatedAt}]} - push local edits
async function handlePutCollection(request, env) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);
  if (!(await checkRateLimit(env, `push:${user.sub}`, 300))) {
    return json(request, { error: 'Too many changes. Try again later.' }, 429);
  }

  const body = await readJson(request, MAX_PUSH_BODY_BYTES);
  const changes = body && body.changes;
  if (!Array.isArray(changes) || changes.length > MAX_CHANGES_PER_PUSH) {
    return json(request, { error: `changes must be an array of at most ${MAX_CHANGES_PER_PUSH}.` }, 400);
  }

  const now = Date.now();
  const latest = new Map();   // one change per id: the newest wins
  for (const change of changes) {
    const { id, data, updatedAt } = change || {};
    if (!Number.isInteger(id) || id < 1 || id > MAX_ITEM_ID
        || !data || typeof data !== 'object' || Array.isArray(data)
        || typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || updatedAt < 0) {
      return json(request, { error: 'Invalid change entry.' }, 400);
    }
    const stamp = Math.min(Math.floor(updatedAt), now + MAX_FUTURE_SKEW);
    const previous = latest.get(id);
    if (!previous || stamp > previous.updatedAt) latest.set(id, { data: sanitizeItemData(data), updatedAt: stamp });
  }

  if (latest.size > 0) {
    const ids = JSON.stringify([...latest.keys()]);
    const { n: newRows } = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM json_each(?2) AS j
       WHERE NOT EXISTS (SELECT 1 FROM items WHERE sub = ?1 AND item_id = j.value)`
    ).bind(user.sub, ids).first();
    if (newRows > 0) {
      const { n: existing } = await env.DB.prepare('SELECT COUNT(*) AS n FROM items WHERE sub = ?')
        .bind(user.sub).first();
      if (existing + newRows > MAX_ROWS_PER_USER) {
        return json(request, { error: 'Collection is too large.' }, 413);
      }
    }
  }

  const statements = [env.DB.prepare('UPDATE users SET seq = seq + 1 WHERE sub = ?').bind(user.sub)];
  for (const [id, { data, updatedAt }] of latest) {
    statements.push(env.DB.prepare(
      `INSERT INTO items (sub, item_id, data, owned, updated_at, seq)
       VALUES (?1, ?2, ?3, ?4, ?5, (SELECT seq FROM users WHERE sub = ?1))
       ON CONFLICT (sub, item_id) DO UPDATE SET
         data = excluded.data, owned = excluded.owned,
         updated_at = excluded.updated_at, seq = excluded.seq
       WHERE excluded.updated_at > items.updated_at`
    ).bind(user.sub, id, JSON.stringify(data), data.owned ? 1 : 0, updatedAt));
  }
  // Keep a linked public profile's count current (no-op when there is none).
  statements.push(env.DB.prepare(
    `UPDATE profiles SET
       owned_count = ${LINKED_OWNED_COUNT},
       last_updated = ?2
     WHERE sub = ?1`
  ).bind(user.sub, now));
  statements.push(env.DB.prepare('SELECT seq FROM users WHERE sub = ?').bind(user.sub));

  const results = await env.DB.batch(statements);
  if (results[results.length - 2].meta.changes > 0) profilesChanged();
  const cursor = results[results.length - 1].results[0].seq;
  return json(request, { success: true, cursor, serverTime: now });
}

// GET /account/export - everything stored for this account
async function handleAccountExport(request, env) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  const [account, items] = await env.DB.batch([
    env.DB.prepare('SELECT email, created_at FROM users WHERE sub = ?').bind(user.sub),
    env.DB.prepare('SELECT item_id, data, updated_at FROM items WHERE sub = ? ORDER BY item_id').bind(user.sub)
  ]);
  const row = account.results[0];
  const date = new Date().toISOString().slice(0, 10);
  return json(request, {
    account: { email: row.email, createdAt: new Date(row.created_at).toISOString() },
    profile: await shareFor(env, user.sub),
    items: items.results.map(item => ({
      id: item.item_id,
      ...JSON.parse(item.data),
      updatedAt: new Date(item.updated_at).toISOString()
    }))
  }, 200, { 'Content-Disposition': `attachment; filename="acdb-account-${date}.json"` });
}

// DELETE /account - remove the account, its collection, sessions and profile
async function handleAccountDelete(request, env) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM items WHERE sub = ?').bind(user.sub),
    env.DB.prepare('DELETE FROM profiles WHERE sub = ?').bind(user.sub),
    env.DB.prepare('DELETE FROM sessions WHERE sub = ?').bind(user.sub),
    env.DB.prepare('DELETE FROM users WHERE sub = ?').bind(user.sub),
    env.DB.prepare('DELETE FROM rate_limits WHERE key = ?').bind(`push:${user.sub}`)
  ]);
  profilesChanged();
  return json(request, { success: true });
}

// ---- Profiles linked to an account ----
// These live in D1 only; their owned items come straight from the synced
// collection, so they never need a manual update.

// POST /share with a Bearer session (called from handleShare)
async function createLinkedProfile(request, env, displayName) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  const existing = await shareFor(env, user.sub);
  if (existing) {
    return json(request, { error: `You already share your collection as ${existing.displayName}.`, code: 'has_profile', displayName: existing.displayName }, 409);
  }

  const nameLower = displayName.toLowerCase();
  const result = await env.DB.prepare(
    `INSERT INTO profiles (name_lower, display_name, sub, owned_count, last_updated)
     VALUES (?2, ?3, ?1, ${LINKED_OWNED_COUNT}, ?4)
     ON CONFLICT DO NOTHING`
  ).bind(user.sub, nameLower, displayName, Date.now()).run();
  if (result.meta.changes === 0) {
    return json(request, { error: 'Display name is already taken.' }, 409);
  }
  profilesChanged();

  return json(request, { success: true, displayName, shareUrl: `${SITE_URL}/#profile/${nameLower}` });
}

// POST /profile/claim {legacyToken} - link a token-owned profile to the account
async function handleClaimProfile(request, env) {
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  const body = await readJson(request);
  const legacyToken = body && body.legacyToken;
  if (typeof legacyToken !== 'string' || legacyToken.length === 0) {
    return json(request, { error: 'Missing legacyToken.' }, 400);
  }

  const profile = await env.DB.prepare('SELECT name_lower, display_name FROM profiles WHERE legacy_token_hash = ?')
    .bind(await sha256Hex(legacyToken)).first();
  if (!profile) return json(request, { error: 'Profile not found.' }, 404);

  const existing = await shareFor(env, user.sub);
  if (existing) {
    return json(request, { error: `You already share your collection as ${existing.displayName}.`, code: 'has_profile', displayName: existing.displayName }, 409);
  }

  await env.DB.prepare(
    `UPDATE profiles SET
       sub = ?1, legacy_token_hash = NULL, owned_items = NULL,
       owned_count = ${LINKED_OWNED_COUNT},
       last_updated = ?2
     WHERE name_lower = ?3`
  ).bind(user.sub, Date.now(), profile.name_lower).run();
  profilesChanged();

  return json(request, { success: true, displayName: profile.display_name });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return handleOptions(request);

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    try {
      if (path === '/share' && method === 'POST') return await handleShare(request, env, ip);
      if (path === '/update' && method === 'PUT') return await handleUpdate(request, env, ip);
      if (path.startsWith('/profile/') && method === 'GET') return await handleGetProfile(request, env, path, ip);
      if (path === '/leaderboard' && method === 'GET') return await handleLeaderboard(request, env);
      if (path.startsWith('/check-name/') && method === 'GET') return await handleCheckName(request, env, path, ip);
      if (path === '/profile' && method === 'DELETE') return await handleDeleteProfile(request, env);
      if (path === '/profile/claim' && method === 'POST') return await handleClaimProfile(request, env);

      if (path === '/auth/google' && method === 'POST') return await handleGoogleAuth(request, env, ip);
      if (path === '/auth/logout' && method === 'POST') return await handleLogout(request, env);
      if (path === '/me' && method === 'GET') return await handleMe(request, env);
      if (path === '/collection' && method === 'GET') return await handleGetCollection(request, env, url);
      if (path === '/collection' && method === 'PUT') return await handlePutCollection(request, env);
      if (path === '/account/export' && method === 'GET') return await handleAccountExport(request, env);
      if (path === '/account' && method === 'DELETE') return await handleAccountDelete(request, env);

      return json(request, { error: 'Not found.' }, 404);
    } catch (err) {
      if (err instanceof HttpError) return json(request, { error: err.message }, err.status);
      console.error(err);
      return json(request, { error: 'Internal server error.' }, 500);
    }
  },

  // Daily cron: drop expired sessions and old rate-limit windows.
  async scheduled(event, env, ctx) {
    const now = Date.now();
    ctx.waitUntil(env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
      env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(hourBucket(now) - 24)
    ]));
  }
};
