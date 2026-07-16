const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GolarzAdmin2026';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const SESSION_MAX_AGE = 24 * 60 * 60; // seconds

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach(pair => {
    const idx = pair.indexOf(':') === -1 ? pair.indexOf('=') : pair.indexOf(':');
    const [k, ...v] = idx === -1 ? [pair.trim()] : [pair.slice(0, idx).trim(), pair.slice(idx + 1).trim()];
    out[k] = v.join('=').trim();
  });
  return out;
}

function signPayload(payload) {
  return crypto.createHmac('sha256', ADMIN_PASSWORD).update(payload).digest('hex');
}

function makeSessionToken(user) {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${user}:${expires}`;
  const sig = signPayload(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64');
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

async function serveAdminPage(res) {
  const adminPath = path.join(__dirname, '..', 'admin-page.html');
  try {
    const html = await fs.readFile(adminPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(html);
  } catch (err) {
    res.statusCode = 500;
    return res.end('Server error');
  }
}

function loginFormHtml(message) {
  return `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>Admin Login</title></head>
  <body>
    <h2>Admin login</h2>
    ${message ? `<p style="color:red">${message}</p>` : ''}
    <form method="post">
      <label>Username: <input name="username" /></label><br/>
      <label>Password: <input name="password" type="password"/></label><br/>
      <button type="submit">Login</button>
    </form>
  </body>
  </html>`;
}

module.exports = async (req, res) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const session = cookies.admin_session;

  if (req.method === 'GET') {
    if (session && verifySessionToken(session)) {
      return serveAdminPage(res);
    }
    // show login form
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(loginFormHtml());
  }

  if (req.method === 'POST') {
    // collect body
    let body = '';
    for await (const chunk of req) body += chunk;
    const params = new URLSearchParams(body);
    const user = params.get('username') || '';
    const password = params.get('password') || '';

    if (user !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.statusCode = 401;
      return res.end(loginFormHtml('Invalid credentials'));
    }

    const token = makeSessionToken(user);
    const cookie = `admin_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax`;
    // Set Secure only on HTTPS (Vercel uses HTTPS)
    res.setHeader('Set-Cookie', cookie + '; Secure');
    // redirect to /admin (rewritten by Vercel to this function)
    res.statusCode = 302;
    res.setHeader('Location', '/admin');
    return res.end('');
  }

  res.statusCode = 405;
  res.setHeader('Allow', 'GET, POST');
  return res.end('Method Not Allowed');
};