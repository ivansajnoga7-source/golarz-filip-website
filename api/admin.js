const fs = require('fs').promises;
const path = require('path');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GolarzAdmin2026';
const ADMIN_USERNAME = 'admin';

function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
  res.statusCode = 401;
  res.end('Unauthorized');
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end('Method Not Allowed');
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    return unauthorized(res);
  }

  const encoded = auth.slice(6);
  let decoded;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch (err) {
    return unauthorized(res);
  }

  const [user, password] = decoded.split(':');
  if (password !== ADMIN_PASSWORD) {
    return unauthorized(res);
  }

  const adminPath = path.join(__dirname, '..', 'admin.html');
  try {
    const html = await fs.readFile(adminPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(html);
  } catch (err) {
    res.statusCode = 500;
    return res.end('Server error');
  }
};