const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(BOOKINGS_FILE);
    } catch (e) {
      await fs.writeFile(BOOKINGS_FILE, '[]', 'utf8');
    }
  } catch (err) {
    console.error('Failed to prepare data file', err);
    process.exit(1);
  }
}

async function readBookings() {
  const raw = await fs.readFile(BOOKINGS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}
async function writeBookings(bs) {
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bs, null, 2), 'utf8');
}

app.get('/api/bookings', async (req, res) => {
  try {
    const bs = await readBookings();
    res.json(bs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'read_failed' });
  }
});

// export CSV
app.get('/api/bookings/csv', async (req, res) => {
  try {
    const bs = await readBookings();
    const header = ['datetime','name','phone','barber','createdAt'];
    const rows = bs.map(b => header.map(h => String(b[h] ?? '').replace(/"/g, '""')));
    const csv = [header.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'csv_failed' });
  }
});

// delete booking by datetime (expects JSON body { datetime })
app.delete('/api/bookings', async (req, res) => {
  try {
    const { datetime } = req.body || {};
    if (!datetime) return res.status(400).json({ error: 'missing_datetime' });
    const bs = await readBookings();
    const idx = bs.findIndex(b => b.datetime === datetime);
    if (idx === -1) return res.status(404).json({ error: 'not_found' });
    bs.splice(idx, 1);
    await writeBookings(bs);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'delete_failed' });
  }
});

// GET /api/reviews — fetch Google Places reviews with simple file cache
app.get('/api/reviews', async (req, res) => {
  const CACHE_FILE = path.join(DATA_DIR, 'reviews.json');
  const TTL = (12 * 60 * 60 * 1000); // 12 hours
  const PLACE_ID = process.env.GOOGLE_PLACE_ID;
  const API_KEY = process.env.GOOGLE_API_KEY;

  // if no API_KEY, return 404 so client can fallback
  if (!PLACE_ID || !API_KEY) return res.status(404).json({ error: 'no_google_config' });

  try {
    // return cache if fresh
    try {
      const st = await fs.stat(CACHE_FILE);
      if (Date.now() - st.mtimeMs < TTL) {
        const cached = await fs.readFile(CACHE_FILE, 'utf8');
        return res.json(JSON.parse(cached || '[]'));
      }
    } catch (e) { /* no cache, continue */ }

    // fetch from Google Places Details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(PLACE_ID)}&fields=reviews,rating&key=${encodeURIComponent(API_KEY)}`;
    const gres = await fetch(url);
    if (!gres.ok) return res.status(502).json({ error: 'google_fetch_failed' });
    const gj = await gres.json();
    const reviews = (gj.result?.reviews || []).map(r => ({
      author: r.author_name,
      text: r.text,
      rating: r.rating,
      time: r.time
    }));

    // write cache (best-effort)
    try { await writeFileAtomic(CACHE_FILE, JSON.stringify(reviews, null, 2)); } catch (e) { /* ignore */ }

    return res.json(reviews);
  } catch (err) {
    console.error('reviews endpoint error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// helper: write file ensuring directory (use fs.writeFile already available)
async function writeFileAtomic(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
}

app.post('/api/bookings', async (req, res) => {
  try {
    const { datetime, name, phone, barber } = req.body || {};
    if (!datetime || !name || !phone) return res.status(400).json({ error: 'missing_fields' });
    const bs = await readBookings();
    if (bs.some(b => b.datetime === datetime)) return res.status(409).json({ error: 'slot_taken' });
    const booking = { datetime, name, phone, barber: barber || null, createdAt: new Date().toISOString() };
    bs.push(booking);
    await writeBookings(bs);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'write_failed' });
  }
});

const PORT = process.env.PORT || 3001;
ensureDataFile().then(() => {
  app.listen(PORT, () => console.log(`Booking API listening on http://localhost:${PORT}/api/bookings`));
});
