const fetch = global.fetch || require('node-fetch');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // service_role or anon (service_role recommended for server-side)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GolarzAdmin2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const SESSION_MAX_AGE = 24 * 60 * 60;

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = v;
  });
  return out;
}

function signPayload(payload) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('hex');
}

function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const lastDot = decoded.lastIndexOf('.');
    if (lastDot === -1) return false;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = signPayload(payload);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const [user, expires] = payload.split(':');
    if (!user || !expires) return false;
    if (Date.now() > Number(expires)) return false;
    return true;
  } catch (err) {
    return false;
  }
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_KEY not set — bookings API will fail without them.');
}

async function supabaseRequest(path, options = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`;
  const headers = Object.assign({
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }, options.headers || {});
  const res = await fetch(url + (options.query || ''), Object.assign({}, options, { headers }));
  return res;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end('');
  }

  // Routes: GET -> list (admin); POST -> create (public); DELETE -> delete (admin)
  const cookies = parseCookies(req.headers.cookie || '');
  const session = cookies.admin_session;

  if (req.method === 'GET') {
    // require admin
    if (!session || !verifySessionToken(session)) {
      res.statusCode = 401;
      return res.end('Unauthorized');
    }
    try {
      const r = await supabaseRequest('bookings?select=*&order=created_at.desc');
      const data = await r.json();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(data));
    } catch (err) {
      res.statusCode = 500;
      return res.end('Error fetching bookings');
    }
  }

  if (req.method === 'POST') {
    // create booking — accept JSON body
    let body = '';
    for await (const chunk of req) body += chunk;
    let payload;
    try {
      payload = JSON.parse(body || '{}');
    } catch (err) {
      res.statusCode = 400;
      return res.end('Invalid JSON');
    }
    
    // Frontend sends: { datetime (ISO string), name, phone, barber }
    // We need to extract date and time for the bookings table
    const { datetime, name, phone, barber, note } = payload;
    
    if (!name || !datetime) {
      res.statusCode = 400;
      return res.end('Missing required fields: name and datetime');
    }
    
    // Parse ISO datetime (e.g., "2026-08-11T11:30:00.000Z")
    let date, time;
    try {
      const dt = new Date(datetime);
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      const hh = String(dt.getUTCHours()).padStart(2, '0');
      const mm = String(dt.getUTCMinutes()).padStart(2, '0');
      date = `${y}-${m}-${d}`;
      time = `${hh}:${mm}:00`;
    } catch (err) {
      res.statusCode = 400;
      return res.end('Invalid datetime format');
    }
    
    try {
      const r = await supabaseRequest('bookings', {
        method: 'POST',
        body: JSON.stringify({ name, phone, date, time, note: barber || note }),
        query: ''
      });
      const data = await r.json();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(data));
    } catch (err) {
      res.statusCode = 500;
      return res.end('Error creating booking');
    }
  }

  if (req.method === 'DELETE') {
    // require admin
    if (!session || !verifySessionToken(session)) {
      res.statusCode = 401;
      return res.end('Unauthorized');
    }
    // expect query ?id=<uuid>
    const url = new URL(req.url, 'http://localhost');
    const id = url.searchParams.get('id');
    if (!id) {
      res.statusCode = 400;
      return res.end('Missing id');
    }
    try {
      const r = await supabaseRequest(`bookings?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
      const data = await r.json();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(data));
    } catch (err) {
      res.statusCode = 500;
      return res.end('Error deleting booking');
    }
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.end('Method Not Allowed');
};
