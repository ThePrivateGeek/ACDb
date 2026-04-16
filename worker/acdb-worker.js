// ACDb - Cloudflare Worker API
// Handles collection sharing and leaderboard
// KV Binding: ACDB

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://acdb.theprivategeek.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Handle CORS preflight
function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// JSON response helper
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

// Generate a random token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Validate display name: 5-25 chars, alphanumeric + hyphens + underscores
function isValidName(name) {
  return /^[a-zA-Z0-9_-]{5,25}$/.test(name);
}

// Rate limiting: max 10 writes per IP per hour
async function checkRateLimit(env, ip) {
  const key = `rate:${ip}`;
  const current = parseInt(await env.ACDB.get(key)) || 0;
  if (current >= 10) return false;
  await env.ACDB.put(key, String(current + 1), { expirationTtl: 3600 });
  return true;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return handleOptions();

    const url = new URL(request.url);
    const path = url.pathname;
    const ip = request.headers.get('CF-Connecting-IP');

    try {
      // POST /share - Create a new shared profile
      if (path === '/share' && request.method === 'POST') {
        if (!(await checkRateLimit(env, ip))) {
          return json({ error: 'Rate limit exceeded. Try again later.' }, 429);
        }

        const body = await request.json();
        const { displayName, ownedItems } = body;

        if (!displayName || !isValidName(displayName)) {
          return json({ error: 'Display name must be 5-25 characters (letters, numbers, hyphens, underscores).' }, 400);
        }

        if (!Array.isArray(ownedItems)) {
          return json({ error: 'ownedItems must be an array.' }, 400);
        }

        // Check if name is taken
        const nameLower = displayName.toLowerCase();
        const existing = await env.ACDB.get(`name:${nameLower}`);
        if (existing) {
          return json({ error: 'Display name is already taken.' }, 409);
        }

        // Create profile
        const token = generateToken();
        const profile = {
          displayName,
          ownedItems,
          ownedCount: ownedItems.length,
          lastUpdated: new Date().toISOString()
        };

        await env.ACDB.put(`user:${token}`, JSON.stringify(profile));
        await env.ACDB.put(`name:${nameLower}`, token);

        return json({ success: true, token, displayName, shareUrl: `https://acdb.theprivategeek.com/#profile/${nameLower}` });
      }

      // PUT /update - Update an existing shared profile
      if (path === '/update' && request.method === 'PUT') {
        if (!(await checkRateLimit(env, ip))) {
          return json({ error: 'Rate limit exceeded. Try again later.' }, 429);
        }

        const authToken = request.headers.get('Authorization');
        if (!authToken) {
          return json({ error: 'Missing authorization token.' }, 401);
        }

        const profileData = await env.ACDB.get(`user:${authToken}`);
        if (!profileData) {
          return json({ error: 'Profile not found. Token may be invalid.' }, 404);
        }

        const body = await request.json();
        const { ownedItems } = body;

        if (!Array.isArray(ownedItems)) {
          return json({ error: 'ownedItems must be an array.' }, 400);
        }

        const existing = JSON.parse(profileData);
        existing.ownedItems = ownedItems;
        existing.ownedCount = ownedItems.length;
        existing.lastUpdated = new Date().toISOString();

        await env.ACDB.put(`user:${authToken}`, JSON.stringify(existing));

        return json({ success: true, ownedCount: existing.ownedCount, lastUpdated: existing.lastUpdated });
      }

      // GET /profile/:name - View a public profile
      if (path.startsWith('/profile/') && request.method === 'GET') {
        const nameLower = path.replace('/profile/', '').toLowerCase();
        const token = await env.ACDB.get(`name:${nameLower}`);
        if (!token) {
          return json({ error: 'Profile not found.' }, 404);
        }

        const profileData = await env.ACDB.get(`user:${token}`);
        if (!profileData) {
          return json({ error: 'Profile data not found.' }, 404);
        }

        const profile = JSON.parse(profileData);
        // Return public data only (no token)
        return json({
          displayName: profile.displayName,
          ownedItems: profile.ownedItems,
          ownedCount: profile.ownedCount,
          lastUpdated: profile.lastUpdated
        });
      }

      // GET /leaderboard - Get all profiles sorted
      if (path === '/leaderboard' && request.method === 'GET') {
        // List all name: keys to find all profiles
        const nameKeys = await env.ACDB.list({ prefix: 'name:' });
        const profiles = [];

        for (const key of nameKeys.keys) {
          const token = await env.ACDB.get(key.name);
          if (token) {
            const profileData = await env.ACDB.get(`user:${token}`);
            if (profileData) {
              const profile = JSON.parse(profileData);
              profiles.push({
                displayName: profile.displayName,
                ownedCount: profile.ownedCount,
                lastUpdated: profile.lastUpdated
              });
            }
          }
        }

        // Sort by owned count descending
        profiles.sort((a, b) => b.ownedCount - a.ownedCount);

        return json({ profiles });
      }

      // GET /check-name/:name - Check if a display name is available
      if (path.startsWith('/check-name/') && request.method === 'GET') {
        const nameLower = path.replace('/check-name/', '').toLowerCase();
        if (!isValidName(nameLower)) {
          return json({ available: false, error: 'Invalid name format.' });
        }
        const existing = await env.ACDB.get(`name:${nameLower}`);
        return json({ available: !existing });
      }

      // DELETE /profile - Delete own profile
      if (path === '/profile' && request.method === 'DELETE') {
        const authToken = request.headers.get('Authorization');
        if (!authToken) {
          return json({ error: 'Missing authorization token.' }, 401);
        }

        const profileData = await env.ACDB.get(`user:${authToken}`);
        if (!profileData) {
          return json({ error: 'Profile not found.' }, 404);
        }

        const profile = JSON.parse(profileData);
        const nameLower = profile.displayName.toLowerCase();

        await env.ACDB.delete(`user:${authToken}`);
        await env.ACDB.delete(`name:${nameLower}`);

        return json({ success: true, message: 'Profile deleted.' });
      }

      return json({ error: 'Not found.' }, 404);

    } catch (err) {
      return json({ error: 'Internal server error.' }, 500);
    }
  }
};
