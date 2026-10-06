// ACDb - Cloudflare Worker API
// Handles collection sharing and leaderboard
//
// Bindings (dashboard → Worker → Settings → Bindings):
//   DB    D1 database "acdb" (schema: worker/migrations/)
//   ACDB  KV namespace: the original profile store. Read-only backup once
//         profiles have been migrated to D1.
// Variables and secrets (dashboard → Worker → Settings → Variables and Secrets):
//   PROFILES_BACKEND  "kv" (the default) serves profiles from KV, "d1" from D1.
//                     Switch to "d1" after POST /admin/migrate-kv reports done.
//   ADMIN_KEY         secret for POST /admin/migrate-kv
//   GOOGLE_CLIENT_ID      text: OAuth client id (Google Cloud → Credentials)
//   GOOGLE_CLIENT_SECRET  secret: that client's secret
// Cron trigger: daily (e.g. "0 3 * * *") cleans up expired rows.
// See worker/README.md for the deploy runbook.

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
    'Content-Type': 'application/json'
  };
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

// Parse a JSON request body; null when it is missing or malformed.
async function readJson(request) {
  try {
    return await request.json();
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

// Validate ownedItems: array of non-empty strings, bounded in count and length
const MAX_OWNED_ITEMS = 2000;
const MAX_ITEM_NAME_LENGTH = 200;
function validateOwnedItems(ownedItems) {
  if (!Array.isArray(ownedItems)) return 'ownedItems must be an array.';
  if (ownedItems.length > MAX_OWNED_ITEMS) return `ownedItems exceeds maximum of ${MAX_OWNED_ITEMS}.`;
  for (const name of ownedItems) {
    if (typeof name !== 'string' || name.length === 0) return 'ownedItems must contain non-empty strings.';
    if (name.length > MAX_ITEM_NAME_LENGTH) return `ownedItems entry exceeds ${MAX_ITEM_NAME_LENGTH} characters.`;
  }
  return null;
}

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
// Fixed one-hour window per key, counted in D1 (one row write per check).
function hourBucket(ms) {
  return Math.floor(ms / 3600000);
}

async function checkRateLimit(env, key, limit) {
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
       window_start = excluded.window_start
     RETURNING count`
  ).bind(key, hourBucket(Date.now())).first();
  return row.count <= limit;
}

// ---- Profile stores ----
// Both stores expose the same methods so the routes below don't care where
// profiles live. The KV store goes away once D1 has been in use for a while.
// Times are epoch ms in and ISO strings out (the API's lastUpdated format).

const kvProfiles = {
  async nameExists(env, nameLower) {
    return !!(await env.ACDB.get(`name:${nameLower}`));
  },

  // Returns false when the name is already taken.
  async create(env, { nameLower, displayName, token, ownedItems, now }) {
    if (await this.nameExists(env, nameLower)) return false;
    const profile = {
      displayName,
      ownedItems,
      ownedCount: ownedItems.length,
      lastUpdated: new Date(now).toISOString()
    };
    await env.ACDB.put(`user:${token}`, JSON.stringify(profile));
    await env.ACDB.put(`name:${nameLower}`, token);
    return true;
  },

  // Returns false when no profile has this token.
  async updateByToken(env, token, ownedItems, now) {
    const profileData = await env.ACDB.get(`user:${token}`);
    if (!profileData) return false;
    const existing = JSON.parse(profileData);
    existing.ownedItems = ownedItems;
    existing.ownedCount = ownedItems.length;
    existing.lastUpdated = new Date(now).toISOString();
    await env.ACDB.put(`user:${token}`, JSON.stringify(existing));
    return true;
  },

  async getByName(env, nameLower) {
    const token = await env.ACDB.get(`name:${nameLower}`);
    if (!token) return null;
    const profileData = await env.ACDB.get(`user:${token}`);
    if (!profileData) return null;
    const profile = JSON.parse(profileData);
    return {
      displayName: profile.displayName,
      ownedItems: profile.ownedItems,
      ownedCount: profile.ownedCount,
      lastUpdated: profile.lastUpdated
    };
  },

  async leaderboard(env) {
    const nameKeys = await env.ACDB.list({ prefix: 'name:' });
    const profiles = [];
    for (const key of nameKeys.keys) {
      const token = await env.ACDB.get(key.name);
      if (!token) continue;
      const profileData = await env.ACDB.get(`user:${token}`);
      if (!profileData) continue;
      const profile = JSON.parse(profileData);
      profiles.push({
        displayName: profile.displayName,
        ownedCount: profile.ownedCount,
        lastUpdated: profile.lastUpdated
      });
    }
    profiles.sort((a, b) => b.ownedCount - a.ownedCount);
    return profiles;
  },

  // Returns false when no profile has this token.
  async deleteByToken(env, token) {
    const profileData = await env.ACDB.get(`user:${token}`);
    if (!profileData) return false;
    const profile = JSON.parse(profileData);
    await env.ACDB.delete(`user:${token}`);
    await env.ACDB.delete(`name:${profile.displayName.toLowerCase()}`);
    return true;
  }
};

// D1 keeps only a SHA-256 hash of each profile's edit token.
const d1Profiles = {
  async nameExists(env, nameLower) {
    return !!(await env.DB.prepare('SELECT 1 FROM profiles WHERE name_lower = ?')
      .bind(nameLower).first());
  },

  async create(env, { nameLower, displayName, token, ownedItems, now }) {
    const result = await env.DB.prepare(
      `INSERT INTO profiles (name_lower, display_name, legacy_token_hash, owned_items, owned_count, last_updated)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT DO NOTHING`
    ).bind(nameLower, displayName, await sha256Hex(token), JSON.stringify(ownedItems), ownedItems.length, now).run();
    return result.meta.changes === 1;
  },

  async updateByToken(env, token, ownedItems, now) {
    const result = await env.DB.prepare(
      'UPDATE profiles SET owned_items = ?, owned_count = ?, last_updated = ? WHERE legacy_token_hash = ?'
    ).bind(JSON.stringify(ownedItems), ownedItems.length, now, await sha256Hex(token)).run();
    return result.meta.changes === 1;
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

  async leaderboard(env) {
    // name_lower as tie-breaker matches the KV store's order (keys list alphabetically)
    const { results } = await env.DB.prepare(
      'SELECT display_name, owned_count, last_updated FROM profiles ORDER BY owned_count DESC, name_lower'
    ).all();
    return results.map(row => ({
      displayName: row.display_name,
      ownedCount: row.owned_count,
      lastUpdated: new Date(row.last_updated).toISOString()
    }));
  },

  async deleteByToken(env, token) {
    const result = await env.DB.prepare('DELETE FROM profiles WHERE legacy_token_hash = ?')
      .bind(await sha256Hex(token)).run();
    return result.meta.changes === 1;
  }
};

function profileStore(env) {
  return env.PROFILES_BACKEND === 'd1' ? d1Profiles : kvProfiles;
}

// ---- Route handlers ----

// POST /share - Create a new shared profile. Signed out: a token-owned
// snapshot of ownedItems. Signed in (Bearer session): a profile linked to the
// account, which follows the synced collection and ignores ownedItems.
async function handleShare(request, env, ip) {
  if (!(await checkRateLimit(env, `write:${ip}`, 10))) {
    return json(request, { error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  const body = await readJson(request);
  if (!body) return json(request, { error: 'Invalid JSON body.' }, 400);
  const { displayName, ownedItems } = body;

  if (!displayName || !isValidName(displayName)) {
    return json(request, { error: 'Display name must be 5-25 characters (letters, numbers, hyphens, underscores).' }, 400);
  }

  if (bearerToken(request)) return createLinkedProfile(request, env, displayName);

  const ownedError = validateOwnedItems(ownedItems);
  if (ownedError) return json(request, { error: ownedError }, 400);

  const nameLower = displayName.toLowerCase();
  const token = generateToken();
  const created = await profileStore(env).create(env, { nameLower, displayName, token, ownedItems, now: Date.now() });
  if (!created) {
    return json(request, { error: 'Display name is already taken.' }, 409);
  }

  return json(request, { success: true, token, displayName, shareUrl: `${SITE_URL}/#profile/${nameLower}` });
}

// PUT /update - Update an existing shared profile
async function handleUpdate(request, env, ip) {
  if (!(await checkRateLimit(env, `write:${ip}`, 10))) {
    return json(request, { error: 'Rate limit exceeded. Try again later.' }, 429);
  }

  const authToken = request.headers.get('Authorization');
  if (!authToken) {
    return json(request, { error: 'Missing authorization token.' }, 401);
  }
  if (bearerToken(request)) {
    return json(request, { error: 'Profiles linked to an account update automatically.' }, 400);
  }

  const body = await readJson(request);
  if (!body) return json(request, { error: 'Invalid JSON body.' }, 400);
  const { ownedItems } = body;

  const ownedError = validateOwnedItems(ownedItems);
  if (ownedError) return json(request, { error: ownedError }, 400);

  const now = Date.now();
  const updated = await profileStore(env).updateByToken(env, authToken, ownedItems, now);
  if (!updated) {
    return json(request, { error: 'Profile not found. Token may be invalid.' }, 404);
  }

  return json(request, { success: true, ownedCount: ownedItems.length, lastUpdated: new Date(now).toISOString() });
}

// GET /profile/:name - View a public profile
async function handleGetProfile(request, env, path) {
  const nameLower = path.replace('/profile/', '').toLowerCase();
  const profile = isValidName(nameLower) ? await profileStore(env).getByName(env, nameLower) : null;
  if (!profile) {
    return json(request, { error: 'Profile not found.' }, 404);
  }
  // Public data only (never the token)
  return json(request, profile);
}

// GET /leaderboard - Get all profiles sorted by owned count
async function handleLeaderboard(request, env) {
  const profiles = await profileStore(env).leaderboard(env);
  return json(request, { profiles }, 200, { 'Cache-Control': 'public, max-age=60' });
}

// GET /check-name/:name - Check if a display name is available
async function handleCheckName(request, env, path) {
  const nameLower = path.replace('/check-name/', '').toLowerCase();
  if (!isValidName(nameLower)) {
    return json(request, { available: false, error: 'Invalid name format.' });
  }
  const taken = await profileStore(env).nameExists(env, nameLower);
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
    return json(request, { success: true, message: 'Profile deleted.' });
  }

  const deleted = await profileStore(env).deleteByToken(env, authToken);
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
  if (!(await checkRateLimit(env, `auth:${ip}`, 20))) {
    return json(request, { error: 'Too many sign-in attempts. Try again later.' }, 429);
  }

  const body = await readJson(request);
  const { code, codeVerifier, redirectUri } = body || {};
  if (typeof code !== 'string' || code.length === 0 || code.length > 2048
      || typeof codeVerifier !== 'string' || !/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)
      || !REDIRECT_URIS.includes(redirectUri)) {
    return json(request, { error: 'Invalid sign-in request.' }, 400);
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
const MAX_ITEM_ID = 100000;          // the catalog is ~650 ids today
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

  const body = await readJson(request);
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
       owned_count = (SELECT COUNT(*) FROM items WHERE sub = ?1 AND owned = 1),
       last_updated = ?2
     WHERE sub = ?1`
  ).bind(user.sub, now));
  statements.push(env.DB.prepare('SELECT seq FROM users WHERE sub = ?').bind(user.sub));

  const results = await env.DB.batch(statements);
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
  return json(request, { success: true });
}

// ---- Profiles linked to an account ----
// These live in D1 only; their owned items come straight from the synced
// collection, so they never need a manual update.

// POST /share with a Bearer session (called from handleShare)
async function createLinkedProfile(request, env, displayName) {
  if (env.PROFILES_BACKEND !== 'd1') {
    return json(request, { error: 'Not available yet.' }, 503);
  }
  const user = await authenticate(request, env);
  if (!user) return sessionExpired(request);

  const existing = await shareFor(env, user.sub);
  if (existing) {
    return json(request, { error: `You already share your collection as ${existing.displayName}.`, code: 'has_profile', displayName: existing.displayName }, 409);
  }

  const nameLower = displayName.toLowerCase();
  const result = await env.DB.prepare(
    `INSERT INTO profiles (name_lower, display_name, sub, owned_count, last_updated)
     VALUES (?1, ?2, ?3, (SELECT COUNT(*) FROM items WHERE sub = ?3 AND owned = 1), ?4)
     ON CONFLICT DO NOTHING`
  ).bind(nameLower, displayName, user.sub, Date.now()).run();
  if (result.meta.changes === 0) {
    return json(request, { error: 'Display name is already taken.' }, 409);
  }

  return json(request, { success: true, displayName, shareUrl: `${SITE_URL}/#profile/${nameLower}` });
}

// POST /profile/claim {legacyToken} - link a token-owned profile to the account
async function handleClaimProfile(request, env) {
  if (env.PROFILES_BACKEND !== 'd1') {
    return json(request, { error: 'Not available yet.' }, 503);
  }
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
       owned_count = (SELECT COUNT(*) FROM items WHERE sub = ?1 AND owned = 1),
       last_updated = ?2
     WHERE name_lower = ?3`
  ).bind(user.sub, Date.now(), profile.name_lower).run();

  return json(request, { success: true, displayName: profile.display_name });
}

// ---- One-time KV → D1 profile migration ----
// POST /admin/migrate-kv[?cursor=<nextCursor>] with header X-Admin-Key.
// Copies up to 100 profiles per call; repeat with nextCursor until done.
// Re-running is safe: a profile already in D1 is only refreshed when it is
// still the same token-owned profile and KV holds a newer version, so the
// final catch-up run after switching PROFILES_BACKEND never clobbers a name
// someone claimed in D1 meanwhile.
const MIGRATE_UPSERT = `
  INSERT INTO profiles (name_lower, display_name, legacy_token_hash, owned_items, owned_count, last_updated)
  VALUES (?1, ?2, ?3, ?4, ?5, ?6)
  ON CONFLICT(name_lower) DO UPDATE SET
    owned_items = excluded.owned_items,
    owned_count = excluded.owned_count,
    last_updated = excluded.last_updated
  WHERE profiles.sub IS NULL
    AND profiles.legacy_token_hash = excluded.legacy_token_hash
    AND excluded.last_updated > profiles.last_updated`;

async function isAdminRequest(request, env) {
  if (!env.ADMIN_KEY) return false;
  // Comparing hashes keeps the comparison time independent of the secret.
  const [given, expected] = await Promise.all([
    sha256Hex(request.headers.get('X-Admin-Key') || ''),
    sha256Hex(env.ADMIN_KEY)
  ]);
  return given === expected;
}

async function handleMigrateKv(request, env, url) {
  if (!(await isAdminRequest(request, env))) {
    return json(request, { error: 'Forbidden.' }, 403);
  }

  const cursor = url.searchParams.get('cursor') || undefined;
  const page = await env.ACDB.list({ prefix: 'name:', limit: 100, cursor });

  const rows = await Promise.all(page.keys.map(async key => {
    const token = await env.ACDB.get(key.name);
    const profileData = token && await env.ACDB.get(`user:${token}`);
    if (!profileData) return null;
    const profile = JSON.parse(profileData);
    const ownedItems = Array.isArray(profile.ownedItems) ? profile.ownedItems : [];
    return env.DB.prepare(MIGRATE_UPSERT).bind(
      key.name.slice('name:'.length),
      profile.displayName,
      await sha256Hex(token),
      JSON.stringify(ownedItems),
      Number.isInteger(profile.ownedCount) ? profile.ownedCount : ownedItems.length,
      Date.parse(profile.lastUpdated) || Date.now()
    );
  }));

  const statements = rows.filter(Boolean);
  const results = statements.length ? await env.DB.batch(statements) : [];
  const written = results.reduce((sum, r) => sum + r.meta.changes, 0);

  return json(request, {
    scanned: page.keys.length,
    written,                                   // inserted or refreshed
    unchanged: statements.length - written,    // already up to date in D1
    broken: page.keys.length - statements.length, // name key without profile data
    nextCursor: page.list_complete ? null : page.cursor,
    done: page.list_complete
  });
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
      if (path.startsWith('/profile/') && method === 'GET') return await handleGetProfile(request, env, path);
      if (path === '/leaderboard' && method === 'GET') return await handleLeaderboard(request, env);
      if (path.startsWith('/check-name/') && method === 'GET') return await handleCheckName(request, env, path);
      if (path === '/profile' && method === 'DELETE') return await handleDeleteProfile(request, env);
      if (path === '/profile/claim' && method === 'POST') return await handleClaimProfile(request, env);

      if (path === '/auth/google' && method === 'POST') return await handleGoogleAuth(request, env, ip);
      if (path === '/auth/logout' && method === 'POST') return await handleLogout(request, env);
      if (path === '/me' && method === 'GET') return await handleMe(request, env);
      if (path === '/collection' && method === 'GET') return await handleGetCollection(request, env, url);
      if (path === '/collection' && method === 'PUT') return await handlePutCollection(request, env);
      if (path === '/account/export' && method === 'GET') return await handleAccountExport(request, env);
      if (path === '/account' && method === 'DELETE') return await handleAccountDelete(request, env);

      if (path === '/admin/migrate-kv' && method === 'POST') return await handleMigrateKv(request, env, url);

      return json(request, { error: 'Not found.' }, 404);
    } catch (err) {
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
