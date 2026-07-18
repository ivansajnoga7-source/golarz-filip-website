/* =========================================================================
   GOLARZ FILIP — ADMIN.JS
   Wczytuje SITE_CONFIG, pozwala je edytować w prostym formularzu i
   eksportuje nowy plik js/config.js do wgrania na serwer.
   Zmiany robocze trzymane są w localStorage tej przeglądarki, żeby można
   było wrócić do edycji później — ale jedyny sposób na trwałą publikację
   zmian to podmiana pliku config.js na serwerze (statyczna strona nie ma
   własnej bazy danych).
   ========================================================================= */

const STORAGE_KEY = "golarzFilipAdminDraft";

function loadWorkingConfig() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { /* fall through */ }
  }
  // If SITE_CONFIG is not available (config.js failed to load), provide
  // a minimal default so the admin UI can initialize and user can edit.
  if (typeof window.SITE_CONFIG === 'undefined') {
    console.warn('SITE_CONFIG missing — using default minimal config for admin UI');
    return {
      brand: { name: 'Golarz Filip', tagline: '', slogan: '', logoText: '', favicon: '' },
      hero: { backgroundImage: '', ctaPrimary: 'Umów wizytę', ctaSecondary: 'Zobacz usługi' },
      about: { paragraphs: ['', '', ''], stats: [ { value:'', label:'' }, { value:'', label:'' } ] },
      services: { categories: [] },
      barbers: [],
      gallery: { images: [] },
      beforeAfter: { items: [] },
      reviews: { items: [], googleRating: '', googleCount: '' },
      contact: { address: '', phone: '', phoneHref: '', mapsLink: '', mapsEmbedSrc: '', hours: [] },
      booking: { bookingUrl: '#' },
      faq: { items: [] },
      social: { instagram: '', facebook: '', tiktok: '', youtube: '', x: '' }
    };
  }
  const cfgCopy = JSON.parse(JSON.stringify(window.SITE_CONFIG));
  cfgCopy.social = Object.assign({ instagram: '', facebook: '', tiktok: '', youtube: '', x: '' }, cfgCopy.social || {});
  return cfgCopy;
}

let cfg = loadWorkingConfig();

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

function val(id) { return document.getElementById(id)?.value ?? ""; }
function setVal(id, v) { const n = document.getElementById(id); if (n) n.value = v ?? ""; }

/* ---------------- populate simple fields ---------------------------------- */
function populateForm() {
  setVal("brand_name", cfg.brand.name);
  setVal("brand_tagline", cfg.brand.tagline);
  setVal("brand_slogan", cfg.brand.slogan);

  setVal("about_p1", cfg.about.paragraphs[0]);
  setVal("about_p2", cfg.about.paragraphs[1]);
  setVal("about_p3", cfg.about.paragraphs[2]);

  setVal("stat_0_value", cfg.about.stats[0]?.value);
  setVal("stat_0_label", cfg.about.stats[0]?.label);
  setVal("stat_1_value", cfg.about.stats[1]?.value);
  setVal("stat_1_label", cfg.about.stats[1]?.label);

  setVal("contact_address", cfg.contact.address);
  setVal("contact_phone", cfg.contact.phone);
  setVal("booking_url", cfg.booking.bookingUrl);

  cfg.social = Object.assign({ instagram: '', facebook: '', tiktok: '', youtube: '', x: '' }, cfg.social || {});
  setVal("social_instagram", cfg.social.instagram);
  setVal("social_facebook", cfg.social.facebook);
  setVal("social_tiktok", cfg.social.tiktok);
  setVal("social_youtube", cfg.social.youtube);
  setVal("social_x", cfg.social.x);

  renderServices();
  renderBarbers();
  renderReviews();
  renderHours();
}

/* ---------------- services -------------------------------------------------- */
function renderServices() {
  const wrap = document.getElementById("servicesEditor");
  wrap.innerHTML = "";
  cfg.services.categories.forEach((cat, ci) => {
    const block = document.createElement("div");
    block.className = "repeat-block";
    block.innerHTML = `
      <button class="remove-btn" data-cat="${ci}">Usuń kategorię ✕</button>
      <div class="subhead">Kategoria</div>
      <label>Nazwa kategorii <input type="text" data-field="catname" data-cat="${ci}" value="${escapeAttr(cat.name)}"></label>
      <div id="items-${ci}"></div>
      <button class="admin-btn" data-addservice="${ci}" type="button">+ Dodaj usługę</button>
    `;
    wrap.appendChild(block);
    const itemsWrap = block.querySelector(`#items-${ci}`);
    cat.items.forEach((item, ii) => {
      const row = document.createElement("div");
      row.className = "grid4";
      row.style.marginBottom = "10px";
      row.innerHTML = `
        <label>Usługa <input type="text" data-field="itemname" data-cat="${ci}" data-item="${ii}" value="${escapeAttr(item.name)}"></label>
        <label>Cena <input type="text" data-field="itemprice" data-cat="${ci}" data-item="${ii}" value="${escapeAttr(item.price)}"></label>
        <label>Czas <input type="text" data-field="itemduration" data-cat="${ci}" data-item="${ii}" value="${escapeAttr(item.duration)}"></label>
        <label>&nbsp;<button class="admin-btn" data-removeitem="${ci}:${ii}" type="button">Usuń</button></label>
      `;
      itemsWrap.appendChild(row);
    });
  });
}

function escapeAttr(str) {
  return String(str ?? "").replace(/"/g, "&quot;");
}

document.addEventListener("input", (e) => {
  const f = e.target.dataset.field;
  if (f === "catname") cfg.services.categories[e.target.dataset.cat].name = e.target.value;
  if (f === "itemname") cfg.services.categories[e.target.dataset.cat].items[e.target.dataset.item].name = e.target.value;
  if (f === "itemprice") cfg.services.categories[e.target.dataset.cat].items[e.target.dataset.item].price = e.target.value;
  if (f === "itemduration") cfg.services.categories[e.target.dataset.cat].items[e.target.dataset.item].duration = e.target.value;
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest('button');
  // DEBUG: log button clicks when troubleshooting
  console.log('admin click:', btn && btn.id, btn && btn.dataset);
  if (!btn) return;
  const ds = btn.dataset || {};

  if (ds.addservice !== undefined) {
    const ci = ds.addservice;
    cfg.services.categories[ci].items.push({ name: "Nowa usługa", price: "0 zł", duration: "30 min" });
    renderServices();
    return;
  }
  if (ds.removeitem) {
    const [ci, ii] = ds.removeitem.split(":");
    cfg.services.categories[ci].items.splice(ii, 1);
    renderServices();
    return;
  }
  if (btn.classList.contains("remove-btn") && ds.cat !== undefined) {
    cfg.services.categories.splice(ds.cat, 1);
    renderServices();
    return;
  }
  if (btn.id === "addServiceCategory") {
    cfg.services.categories.push({ name: "Nowa kategoria", items: [] });
    renderServices();
    return;
  }
  if (btn.id === "addBarber") {
    cfg.barbers.push({ name: "Imię", role: "Barber", bio: "Krótki opis.", photo: "/images/hero.jpg" });
    renderBarbers();
    return;
  }
  if (ds.removebarber !== undefined) {
    cfg.barbers.splice(ds.removebarber, 1);
    renderBarbers();
    return;
  }
  if (btn.id === "addReview") {
    cfg.reviews.items.push({ author: "Imię Nazwisko", rating: 5, text: "Treść opinii." });
    renderReviews();
    return;
  }
  if (ds.removereview !== undefined) {
    cfg.reviews.items.splice(ds.removereview, 1);
    renderReviews();
    return;
  }
  if (btn.id === "downloadBtn" || btn.id === "downloadBtn2") {
    downloadConfig();
    return;
  }
  if (btn.id === "resetBtn") {
    localStorage.removeItem(STORAGE_KEY);
    cfg = JSON.parse(JSON.stringify(window.SITE_CONFIG));
    populateForm();
    return;
  }
});

/* ---------------- barbers -------------------------------------------------- */
function renderBarbers() {
  const wrap = document.getElementById("barbersEditor");
  wrap.innerHTML = "";
  cfg.barbers.forEach((b, i) => {
    const block = document.createElement("div");
    block.className = "repeat-block";
    block.innerHTML = `
      <button class="remove-btn" data-removebarber="${i}">Usuń ✕</button>
      <div class="grid2">
        <label>Imię <input type="text" data-bfield="name" data-b="${i}" value="${escapeAttr(b.name)}"></label>
        <label>Rola <input type="text" data-bfield="role" data-b="${i}" value="${escapeAttr(b.role)}"></label>
      </div>
      <label>Opis <textarea rows="2" data-bfield="bio" data-b="${i}">${escapeAttr(b.bio)}</textarea></label>
      <label>Ścieżka do zdjęcia <input type="text" data-bfield="photo" data-b="${i}" value="${escapeAttr(b.photo)}"></label>
    `;
    wrap.appendChild(block);
  });
}
document.addEventListener("input", (e) => {
  const f = e.target.dataset.bfield;
  if (f) cfg.barbers[e.target.dataset.b][f] = e.target.value;
});

/* ---------------- reviews -------------------------------------------------- */
function renderReviews() {
  const wrap = document.getElementById("reviewsEditor");
  wrap.innerHTML = "";
  cfg.reviews.items.forEach((r, i) => {
    const block = document.createElement("div");
    block.className = "repeat-block";
    block.innerHTML = `
      <button class="remove-btn" data-removereview="${i}">Usuń ✕</button>
      <div class="grid2">
        <label>Autor <input type="text" data-rfield="author" data-r="${i}" value="${escapeAttr(r.author)}"></label>
        <label>Ocena (1-5) <input type="number" min="1" max="5" data-rfield="rating" data-r="${i}" value="${r.rating}"></label>
      </div>
      <label>Treść opinii <textarea rows="2" data-rfield="text" data-r="${i}">${escapeAttr(r.text)}</textarea></label>
    `;
    wrap.appendChild(block);
  });
}
document.addEventListener("input", (e) => {
  const f = e.target.dataset.rfield;
  if (f) {
    const v = f === "rating" ? Number(e.target.value) : e.target.value;
    cfg.reviews.items[e.target.dataset.r][f] = v;
  }
});

/* ---------------- hours ----------------------------------------------------- */
function renderHours() {
  const wrap = document.getElementById("hoursEditor");
  wrap.innerHTML = "";
  cfg.contact.hours.forEach((h, i) => {
    wrap.innerHTML += `
      <label>${h.day} <input type="text" data-hfield="hours" data-h="${i}" value="${escapeAttr(h.hours)}"></label>
    `;
  });
}
document.addEventListener("input", (e) => {
  const f = e.target.dataset.hfield;
  if (f) cfg.contact.hours[e.target.dataset.h][f] = e.target.value;
});

/* ---------------- simple fields → cfg -------------------------------------- */
["brand_name","brand_tagline","brand_slogan","about_p1","about_p2","about_p3",
 "stat_0_value","stat_0_label","stat_1_value","stat_1_label",
 "contact_address","contact_phone","booking_url","social_instagram","social_facebook","social_tiktok","social_youtube","social_x"
].forEach(id => {
  document.addEventListener("input", (e) => {
    if (e.target.id !== id) return;
    const v = e.target.value;
    if (id === "brand_name") cfg.brand.name = v;
    if (id === "brand_tagline") cfg.brand.tagline = v;
    if (id === "brand_slogan") cfg.brand.slogan = v;
    if (id === "about_p1") cfg.about.paragraphs[0] = v;
    if (id === "about_p2") cfg.about.paragraphs[1] = v;
    if (id === "about_p3") cfg.about.paragraphs[2] = v;
    if (id === "stat_0_value") cfg.about.stats[0].value = v;
    if (id === "stat_0_label") cfg.about.stats[0].label = v;
    if (id === "stat_1_value") cfg.about.stats[1].value = v;
    if (id === "stat_1_label") cfg.about.stats[1].label = v;
    if (id === "contact_address") cfg.contact.address = v;
    if (id === "contact_phone") cfg.contact.phone = v;
    if (id === "booking_url") cfg.booking.bookingUrl = v;
    if (id === "social_instagram") cfg.social.instagram = v;
    if (id === "social_facebook") cfg.social.facebook = v;
    if (id === "social_tiktok") cfg.social.tiktok = v;
    if (id === "social_youtube") cfg.social.youtube = v;
    if (id === "social_x") cfg.social.x = v;
  });
});

/* auto-save draft on any change */
document.addEventListener("input", () => saveDraft());
document.addEventListener("click", () => setTimeout(saveDraft, 0));

/* ---------------- export config.js ------------------------------------------ */
function downloadConfig() {
  const json = JSON.stringify(cfg, null, 2);
  const fileContent = `/* Plik wygenerowany przez panel administracyjny Golarz Filip.\n   Zastąp nim istniejący plik js/config.js na serwerze. */\n\nconst SITE_CONFIG = ${json};\n`;
  const blob = new Blob([fileContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "config.js";
  a.click();
  URL.revokeObjectURL(url);
}

populateForm();

/* ---------------- bookings admin ----------------------------------------- */
function getBookingsApiUrl() {
  const fromCfg = cfg && cfg.booking && cfg.booking.apiUrl;
  return fromCfg || '/api/bookings';
}

async function fetchBookingsFromServer(apiUrl) {
  try {
    const res = await fetch(apiUrl, { credentials: 'same-origin' });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, status: res.status, body };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (e) {
    console.warn('server bookings fetch failed', e);
    return { ok: false, status: 0, body: 'network_error' };
  }
}

function loadLocalBookings() {
  try { return JSON.parse(localStorage.getItem('GF_BOOKINGS') || '[]'); } catch (e) { return []; }
}

function saveLocalBookings(bs) { localStorage.setItem('GF_BOOKINGS', JSON.stringify(bs)); }

function normalizeBookingForAdmin(b) {
  const date = String(b.date || '').trim();
  const time = String(b.time || '').slice(0, 5);
  const createdAt = String(b.created_at || b.createdAt || b.datetime || '').trim();
  const slotStamp = date && time ? new Date(`${date}T${time}:00`) : null;
  const createdStamp = createdAt ? new Date(createdAt) : null;
  const sortStamp = (createdStamp && !Number.isNaN(createdStamp.getTime()) ? createdStamp : null)
    || (slotStamp && !Number.isNaN(slotStamp.getTime()) ? slotStamp : null)
    || new Date(0);

  return Object.assign({}, b, {
    date,
    time,
    barber: b.barber || b.note || 'Bez preferencji',
    created_at: createdAt,
    _sortStamp: sortStamp.getTime(),
    _slotLabel: date && time ? `${date} ${time}` : (b.datetime || '')
  });
}

function renderBookingsList(bookings) {
  const wrap = document.getElementById('bookingsContainer');
  wrap.innerHTML = '';
  if (!bookings || bookings.length === 0) { wrap.innerHTML = '<em>Brak rezerwacji.</em>'; return; }
  const normalized = bookings.map(normalizeBookingForAdmin).sort((a, b) => {
    if (b._sortStamp !== a._sortStamp) return b._sortStamp - a._sortStamp;
    return String(b.date + b.time).localeCompare(String(a.date + a.time));
  });
  const table = document.createElement('table');
  table.style.width = '100%';
  table.innerHTML = '<thead><tr><th>Data</th><th>Godzina</th><th>Imię</th><th>Telefon</th><th>Barber</th><th>Dodano</th><th></th></tr></thead>';
  const tbody = document.createElement('tbody');
  normalized.forEach(b => {
    const tr = document.createElement('tr');
    const created = b.created_at ? new Date(b.created_at).toLocaleString() : '';
    const id = b.id || b.datetime;
    tr.innerHTML = `<td>${escapeAttr(b.date || '')}</td>
                    <td>${escapeAttr(b.time || '')}</td>
                    <td>${escapeAttr(b.name)}</td>
                    <td>${escapeAttr(b.phone)}</td>
                    <td>${escapeAttr(b.barber)}</td>
                    <td>${escapeAttr(created)}</td>
                    <td><button class="admin-btn small" data-delid="${id}">Usuń</button></td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
}

async function refreshBookings() {
  const apiUrl = getBookingsApiUrl();
  const wrap = document.getElementById('bookingsContainer');
  const srv = await fetchBookingsFromServer(apiUrl);
  if (srv.ok) {
    renderBookingsList(srv.data);
    return;
  }

  if (srv.status === 401) {
    wrap.innerHTML = '<em>Sesja wygasła. Przekierowanie do logowania...</em>';
    setTimeout(() => { window.location.href = '/admin'; }, 700);
    return;
  }

  // fallback to local only for network errors
  if (srv.status === 0) {
    renderBookingsList(loadLocalBookings());
    return;
  }

  wrap.innerHTML = `<em>Błąd synchronizacji z serwerem (${srv.status}): ${escapeAttr(srv.body || 'unknown_error')}</em>`;
}

async function deleteBooking(id) {
  const apiUrl = getBookingsApiUrl();
  try {
    const res = await fetch(`${apiUrl}?id=${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'same-origin' });
    if (res.ok) { await refreshBookings(); return true; }
    else { console.warn('delete failed', await res.text()); return false; }
  } catch (e) {
    console.warn(e);
    // fallback local on network errors only
    const bs = loadLocalBookings();
    const idx = bs.findIndex(b => b.id === id || b.datetime === id);
    if (idx !== -1) { bs.splice(idx,1); saveLocalBookings(bs); await refreshBookings(); return true; }
    return false;
  }
}

function downloadCSV(bookings) {
  if (!bookings) bookings = [];
  const header = ['date','time','name','phone','note','id','created_at'];
  const rows = bookings.map(b => header.map(h => '"'+String(b[h]||'').replace(/"/g,'""')+'"'));
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click(); URL.revokeObjectURL(url);
}

// wire booking admin controls
document.getElementById('refreshBookings')?.addEventListener('click', () => refreshBookings());
document.getElementById('exportBookings')?.addEventListener('click', async () => {
  const apiUrl = getBookingsApiUrl();
  if (apiUrl) {
    // try server CSV first
    try {
      const res = await fetch((apiUrl.replace(/\/api\/bookings\/?$/, '/api/bookings/csv')));
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click(); URL.revokeObjectURL(url); return;
      }
    } catch (e) { /* fallthrough to client export */ }
  }
  // fallback to client-side export
  const bookings = loadLocalBookings(); downloadCSV(bookings);
});

document.getElementById('clearBookings')?.addEventListener('click', () => { localStorage.removeItem('GF_BOOKINGS'); refreshBookings(); });

// delegate delete button clicks
document.getElementById('bookingsContainer')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.dataset.delid || btn.dataset.deldatetime; if (!id) return;
  if (!confirm('Usunąć tę rezerwację?')) return;
  deleteBooking(id);
});

// initial load
refreshBookings();
