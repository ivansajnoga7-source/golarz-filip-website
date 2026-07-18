/* =========================================================================
   GOLARZ FILIP — SCRIPT.JS
   Renders SITE_CONFIG (js/config.js) into the page and wires up all
   interactive behaviour: header state, mobile nav, reveal-on-scroll,
   service tabs, gallery lightbox, before/after slider, FAQ accordion.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.SITE_CONFIG;
  if (!cfg) return;

  /* ---------------- helpers ------------------------------------------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };
  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  /* ---------------- brand / header -------------------------------------- */
  document.title = `${cfg.brand.name} — ${cfg.brand.tagline}`;
  document.querySelectorAll(".js-brand-name").forEach(n => {
    n.innerHTML = `<b>${cfg.brand.name.split(" ")[0]}</b> ${cfg.brand.name.split(" ").slice(1).join(" ")}`;
  });
  document.querySelectorAll(".js-booking-url").forEach(n => n.setAttribute("href", cfg.booking.bookingUrl));
  document.querySelectorAll(".js-phone-href").forEach(n => n.setAttribute("href", cfg.contact.phoneHref));

  /* ---------------- hero -------------------------------------------------- */
  const heroBg = document.querySelector(".js-hero-bg");
  if (heroBg) heroBg.style.backgroundImage = `url('${cfg.hero.backgroundImage}')`;
  const heroSlogan = document.querySelector(".js-hero-slogan");
  if (heroSlogan) heroSlogan.textContent = cfg.brand.slogan;
  const ctaP = document.querySelector(".js-cta-primary-label");
  if (ctaP) ctaP.textContent = cfg.hero.ctaPrimary;
  const ctaS = document.querySelector(".js-cta-secondary-label");
  if (ctaS) ctaS.textContent = cfg.hero.ctaSecondary;

  /* ---------------- about -------------------------------------------------- */
  const aboutCopy = document.querySelector(".js-about-copy");
  if (aboutCopy) {
    aboutCopy.innerHTML = cfg.about.paragraphs.map(p => `<p>${p}</p>`).join("");
  }
  const statsWrap = document.querySelector(".js-about-stats");
  if (statsWrap) {
    cfg.about.stats.forEach(s => {
      const box = el("div", "", `<div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div>`);
      statsWrap.appendChild(box);
    });
  }

  /* ---------------- services --------------------------------------------- */
  const tabsWrap = document.querySelector(".js-service-tabs");
  const panelsWrap = document.querySelector(".js-service-panels");
  if (tabsWrap && panelsWrap) {
    cfg.services.categories.forEach((cat, i) => {
      const tab = el("button", "service-tab" + (i === 0 ? " active" : ""), cat.name);
      tab.setAttribute("data-idx", i);
      tabsWrap.appendChild(tab);

      const panel = el("div", "service-panel" + (i === 0 ? " active" : ""));
      panel.setAttribute("data-idx", i);
      cat.items.forEach(item => {
        const row = el("div", "service-row", `
          <div>
            <div class="service-name">${item.name}</div>
            <div class="service-duration">${item.duration}</div>
          </div>
          <div class="service-dots"></div>
          <div class="service-price">${item.price}</div>
        `);
        panel.appendChild(row);
      });
      panelsWrap.appendChild(panel);
    });

    tabsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".service-tab");
      if (!btn) return;
      const idx = btn.getAttribute("data-idx");
      tabsWrap.querySelectorAll(".service-tab").forEach(t => t.classList.toggle("active", t === btn));
      panelsWrap.querySelectorAll(".service-panel").forEach(p => p.classList.toggle("active", p.getAttribute("data-idx") === idx));
    });
  }

  /* ---------------- barbers ------------------------------------------------ */
  const barberGrid = document.querySelector(".js-barber-grid");
  if (barberGrid) {
    cfg.barbers.forEach((b, i) => {
      const card = el("div", "barber-card reveal");
      card.style.setProperty("--i", i);
      card.innerHTML = `
        <div class="barber-photo"><img src="${b.photo}" alt="${b.name} — ${b.role}" loading="lazy"></div>
        <div class="barber-info">
          <div class="barber-name">${b.name}</div>
          <div class="barber-role">${b.role}</div>
          <p class="barber-bio">${b.bio}</p>
        </div>`;
      barberGrid.appendChild(card);
    });
  }

  /* ---------------- gallery -------------------------------------------------- */
  const galleryGrid = document.querySelector(".js-gallery-grid");
  if (galleryGrid) {
    cfg.gallery.images.forEach(img => {
      const item = el("div", "gallery-item reveal");
      item.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
      item.addEventListener("click", () => openLightbox(img.src, img.alt));
      galleryGrid.appendChild(item);
    });
  }
  const lightbox = document.querySelector(".js-lightbox");
  const lightboxImg = document.querySelector(".js-lightbox-img");
  function openLightbox(src, alt) {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add("open");
  }
  document.querySelector(".js-lightbox-close")?.addEventListener("click", () => lightbox.classList.remove("open"));
  lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lightbox?.classList.remove("open"); });

  /* ---------------- before / after ------------------------------------------- */
  const baGrid = document.querySelector(".js-ba-grid");
  if (baGrid) {
    cfg.beforeAfter.items.forEach(item => {
      const card = el("div", "ba-card reveal");
      card.innerHTML = `
        <div class="ba-slider">
          <div class="ba-before"><img src="${item.before}" alt="Przed"></div>
          <div class="ba-after"><img src="${item.after}" alt="Po"></div>
          <div class="ba-handle"></div>
          <div class="ba-tag before">Przed</div>
          <div class="ba-tag after">Po</div>
        </div>
        <div class="ba-label">${item.label}</div>
      `;
      baGrid.appendChild(card);
      const slider = card.querySelector(".ba-slider");
      const after = card.querySelector(".ba-after");
      const handle = card.querySelector(".ba-handle");
      let dragging = false;

      function setPos(clientX) {
        const rect = slider.getBoundingClientRect();
        let pct = ((clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        handle.style.left = pct + "%";
      }
      slider.addEventListener("mousedown", (e) => { dragging = true; setPos(e.clientX); });
      window.addEventListener("mousemove", (e) => { if (dragging) setPos(e.clientX); });
      window.addEventListener("mouseup", () => dragging = false);
      slider.addEventListener("touchstart", (e) => setPos(e.touches[0].clientX), { passive: true });
      slider.addEventListener("touchmove", (e) => setPos(e.touches[0].clientX), { passive: true });
    });
  }

  /* ---------------- reviews ------------------------------------------------------ */
  const reviewTrack = document.querySelector(".js-review-track");
  async function loadReviews() {
    // try server endpoint first
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const list = await res.json();
        return list.map(r => ({ author: r.author, rating: r.rating || 5, text: r.text || '' }));
      }
    } catch (e) { /* ignore and fallback */ }
    // fallback to config
    return cfg.reviews.items || [];
  }
  if (reviewTrack) {
    loadReviews().then(list => {
      list.forEach((r, i) => {
        const card = el("div", "review-card reveal");
        card.style.setProperty("--i", i % 3);
        card.innerHTML = `
          <span class="stars">${stars(r.rating)}</span>
          <p class="review-text">${r.text}</p>
          <div class="review-author">— ${r.author}</div>
        `;
        reviewTrack.appendChild(card);
      });
    }).catch(() => {});
  }
  document.querySelectorAll(".js-google-score").forEach(n => n.textContent = cfg.reviews.googleRating);
  document.querySelectorAll(".js-google-count").forEach(n => n.textContent = cfg.reviews.googleCount);

  /* ---------------- contact ------------------------------------------------------ */
  document.querySelectorAll(".js-address").forEach(n => n.textContent = cfg.contact.address);
  document.querySelectorAll(".js-phone").forEach(n => n.textContent = cfg.contact.phone);
  const hoursWrap = document.querySelector(".js-hours");
  if (hoursWrap) {
    cfg.contact.hours.forEach(h => {
      hoursWrap.appendChild(el("div", "hours-row", `<span>${h.day}</span><span>${h.hours}</span>`));
    });
  }
  const mapFrame = document.querySelector(".js-map-embed");
  if (mapFrame) mapFrame.src = cfg.contact.mapsEmbedSrc;
  document.querySelectorAll(".js-maps-link").forEach(n => n.setAttribute("href", cfg.contact.mapsLink));

  /* ---------------- FAQ ------------------------------------------------------------ */
  const faqList = document.querySelector(".js-faq-list");
  if (faqList) {
    cfg.faq.items.forEach(item => {
      const wrap = el("div", "faq-item");
      wrap.innerHTML = `
        <button class="faq-q"><span>${item.q}</span><span class="plus">+</span></button>
        <div class="faq-a"><p>${item.a}</p></div>
      `;
      wrap.querySelector(".faq-q").addEventListener("click", () => {
        const isOpen = wrap.classList.contains("open");
        faqList.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
        if (!isOpen) wrap.classList.add("open");
      });
      faqList.appendChild(wrap);
    });
  }

  /* ---------------- footer / social ------------------------------------------------- */
  document.querySelectorAll(".js-year").forEach(n => n.textContent = new Date().getFullYear());
  const igLinks = document.querySelectorAll(".js-instagram");
  igLinks.forEach(n => n.setAttribute("href", cfg.social.instagram));
  const fbLinks = document.querySelectorAll(".js-facebook");
  fbLinks.forEach(n => n.setAttribute("href", cfg.social.facebook));

  /* ---------------- header scroll state --------------------------------------------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- mobile nav ------------------------------------------------------- */
  const burger = document.querySelector(".js-burger");
  const mobileNav = document.querySelector(".js-mobile-nav");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("open");
    mobileNav.classList.toggle("open");
  });
  mobileNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    burger.classList.remove("open");
    mobileNav.classList.remove("open");
  }));

  /* ---------------- booking modal / local bookings ------------------------------- */
  (function setupBooking() {
    const BOOKING_KEY = 'GF_BOOKINGS';
    const bookingAnchors = Array.from(document.querySelectorAll('.js-booking-url'));
    const PHONE_COUNTRIES = [
      { code: 'PL', name: 'Polska', dial: '+48', min: 9, max: 9 },
      { code: 'UA', name: 'Ukraina', dial: '+380', min: 9, max: 9 },
      { code: 'DE', name: 'Niemcy', dial: '+49', min: 10, max: 11 },
      { code: 'CZ', name: 'Czechy', dial: '+420', min: 9, max: 9 },
      { code: 'SK', name: 'Slowacja', dial: '+421', min: 9, max: 9 },
      { code: 'LT', name: 'Litwa', dial: '+370', min: 8, max: 8 },
      { code: 'LV', name: 'Lotwa', dial: '+371', min: 8, max: 8 },
      { code: 'EE', name: 'Estonia', dial: '+372', min: 7, max: 8 },
      { code: 'GB', name: 'Wielka Brytania', dial: '+44', min: 10, max: 10 },
      { code: 'IE', name: 'Irlandia', dial: '+353', min: 9, max: 9 },
      { code: 'FR', name: 'Francja', dial: '+33', min: 9, max: 9 },
      { code: 'ES', name: 'Hiszpania', dial: '+34', min: 9, max: 9 },
      { code: 'IT', name: 'Wlochy', dial: '+39', min: 9, max: 10 },
      { code: 'NL', name: 'Holandia', dial: '+31', min: 9, max: 9 },
      { code: 'BE', name: 'Belgia', dial: '+32', min: 8, max: 9 },
      { code: 'AT', name: 'Austria', dial: '+43', min: 10, max: 13 },
      { code: 'NO', name: 'Norwegia', dial: '+47', min: 8, max: 8 },
      { code: 'SE', name: 'Szwecja', dial: '+46', min: 7, max: 10 },
      { code: 'DK', name: 'Dania', dial: '+45', min: 8, max: 8 },
      { code: 'FI', name: 'Finlandia', dial: '+358', min: 9, max: 10 },
      { code: 'PT', name: 'Portugalia', dial: '+351', min: 9, max: 9 },
      { code: 'CH', name: 'Szwajcaria', dial: '+41', min: 9, max: 9 },
      { code: 'RO', name: 'Rumunia', dial: '+40', min: 9, max: 9 },
      { code: 'HU', name: 'Wegry', dial: '+36', min: 9, max: 9 },
      { code: 'BG', name: 'Bulgaria', dial: '+359', min: 8, max: 9 },
      { code: 'HR', name: 'Chorwacja', dial: '+385', min: 8, max: 9 },
      { code: 'SI', name: 'Slowenia', dial: '+386', min: 8, max: 8 },
      { code: 'RS', name: 'Serbia', dial: '+381', min: 8, max: 9 },
      { code: 'BA', name: 'Boznia i Hercegowina', dial: '+387', min: 8, max: 8 },
      { code: 'ME', name: 'Czarnogora', dial: '+382', min: 8, max: 8 },
      { code: 'MK', name: 'Macedonia Polnocna', dial: '+389', min: 8, max: 8 },
      { code: 'AL', name: 'Albania', dial: '+355', min: 8, max: 9 },
      { code: 'GR', name: 'Grecja', dial: '+30', min: 10, max: 10 },
      { code: 'TR', name: 'Turcja', dial: '+90', min: 10, max: 10 },
      { code: 'MD', name: 'Moldawia', dial: '+373', min: 8, max: 8 },
      { code: 'BY', name: 'Bialorus', dial: '+375', min: 9, max: 9 },
      { code: 'RU', name: 'Rosja', dial: '+7', min: 10, max: 10 },
      { code: 'GE', name: 'Gruzja', dial: '+995', min: 9, max: 9 },
      { code: 'AM', name: 'Armenia', dial: '+374', min: 8, max: 8 },
      { code: 'AZ', name: 'Azerbejdzan', dial: '+994', min: 9, max: 9 },
      { code: 'KZ', name: 'Kazachstan', dial: '+7', min: 10, max: 10 },
      { code: 'UZ', name: 'Uzbekistan', dial: '+998', min: 9, max: 9 },
      { code: 'AE', name: 'ZEA', dial: '+971', min: 9, max: 9 },
      { code: 'SA', name: 'Arabia Saudyjska', dial: '+966', min: 9, max: 9 },
      { code: 'IL', name: 'Izrael', dial: '+972', min: 9, max: 9 },
      { code: 'IN', name: 'Indie', dial: '+91', min: 10, max: 10 },
      { code: 'PK', name: 'Pakistan', dial: '+92', min: 10, max: 10 },
      { code: 'BD', name: 'Bangladesz', dial: '+880', min: 10, max: 10 },
      { code: 'CN', name: 'Chiny', dial: '+86', min: 11, max: 11 },
      { code: 'JP', name: 'Japonia', dial: '+81', min: 10, max: 10 },
      { code: 'KR', name: 'Korea Poludniowa', dial: '+82', min: 9, max: 10 },
      { code: 'TH', name: 'Tajlandia', dial: '+66', min: 9, max: 9 },
      { code: 'VN', name: 'Wietnam', dial: '+84', min: 9, max: 10 },
      { code: 'MY', name: 'Malezja', dial: '+60', min: 9, max: 10 },
      { code: 'SG', name: 'Singapur', dial: '+65', min: 8, max: 8 },
      { code: 'ID', name: 'Indonezja', dial: '+62', min: 9, max: 11 },
      { code: 'PH', name: 'Filipiny', dial: '+63', min: 10, max: 10 },
      { code: 'AU', name: 'Australia', dial: '+61', min: 9, max: 9 },
      { code: 'NZ', name: 'Nowa Zelandia', dial: '+64', min: 8, max: 10 },
      { code: 'US', name: 'USA', dial: '+1', min: 10, max: 10 },
      { code: 'CA', name: 'Kanada', dial: '+1', min: 10, max: 10 },
      { code: 'MX', name: 'Meksyk', dial: '+52', min: 10, max: 10 },
      { code: 'BR', name: 'Brazylia', dial: '+55', min: 10, max: 11 },
      { code: 'AR', name: 'Argentyna', dial: '+54', min: 10, max: 10 },
      { code: 'CL', name: 'Chile', dial: '+56', min: 9, max: 9 },
      { code: 'CO', name: 'Kolumbia', dial: '+57', min: 10, max: 10 },
      { code: 'PE', name: 'Peru', dial: '+51', min: 9, max: 9 },
      { code: 'ZA', name: 'RPA', dial: '+27', min: 9, max: 9 },
      { code: 'EG', name: 'Egipt', dial: '+20', min: 10, max: 10 },
      { code: 'MA', name: 'Maroko', dial: '+212', min: 9, max: 9 },
      { code: 'NG', name: 'Nigeria', dial: '+234', min: 10, max: 10 },
      { code: 'KE', name: 'Kenia', dial: '+254', min: 9, max: 9 }
    ];

    function normalizeDigits(v) {
      return String(v || '').replace(/\D/g, '');
    }

    function toE164(dial, national) {
      return `${dial}${normalizeDigits(national)}`;
    }

    function validatePhone(country, national) {
      const digits = normalizeDigits(national);
      if (!digits) return { ok: false, message: 'Wpisz numer telefonu.' };
      if (/^(\d)\1+$/.test(digits)) return { ok: false, message: 'Numer telefonu wygląda nieprawidłowo.' };
      if (digits.length < country.min || digits.length > country.max) {
        return { ok: false, message: `Numer dla ${country.name} musi mieć ${country.min}-${country.max} cyfr.` };
      }
      const e164 = toE164(country.dial, digits);
      if (!/^\+[1-9]\d{7,14}$/.test(e164)) {
        return { ok: false, message: 'Nieprawidłowy format numeru telefonu.' };
      }
      return { ok: true, e164 };
    }

    function loadBookings() {
      try { return JSON.parse(localStorage.getItem(BOOKING_KEY) || '[]'); }
      catch (e) { return []; }
    }
    function saveBookings(bs) { localStorage.setItem(BOOKING_KEY, JSON.stringify(bs)); }
    function isSlotTaken(dtIso) { return loadBookings().some(b => b.datetime === dtIso); }

    function formatLocalIso(date) {
      // return YYYY-MM-DDTHH:MM in local time (match inputs)
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${hh}:${mm}`;
    }

    function createModal() {
      const overlay = document.createElement('div');
      overlay.className = 'booking-modal';
      overlay.innerHTML = `
        <div class="booking-box">
          <button class="booking-close" aria-label="Zamknij">×</button>
          <h3>Zarezerwuj termin</h3>
          <form class="booking-form">
            <label>Imię i nazwisko<input name="name" required></label>
            <label>Kraj / kod
              <input name="countrySearch" type="search" placeholder="Szukaj kraju lub kodu, np. Polska, +48" autocomplete="off">
              <select name="countryCode" required></select>
            </label>
            <label>Telefon<input name="phone" inputmode="tel" placeholder="np. 730 953 579" required></label>
            <label>Data<input name="date" type="date" required></label>
            <label>Godzina
              <select name="time" required>
                <option value="">Wybierz godzinę</option>
              </select>
            </label>
            <label>Barber<select name="barber"></select></label>
            <div class="booking-msg" aria-live="polite"></div>
            <div class="booking-actions">
              <button type="submit" class="btn btn-primary">Zarezerwuj</button>
              <button type="button" class="btn btn-outline booking-cancel">Anuluj</button>
            </div>
          </form>
        </div>`;

      // minimal styles so modal is usable without CSS edits
      const styleId = 'booking-modal-styles';
      if (!document.getElementById(styleId)) {
        const s = document.createElement('style');
        s.id = styleId;
        s.textContent = `
          .booking-modal{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999}
          .booking-box{background:#fff;color:#111;padding:20px;border-radius:8px;max-width:420px;width:92%;box-shadow:0 10px 30px rgba(0,0,0,0.25)}
          .booking-box h3{margin:0 0 10px}
          .booking-box label{display:block;margin:8px 0;font-size:13px}
          .booking-box input,.booking-box select{width:100%;padding:8px;margin-top:6px;border:1px solid #ddd;border-radius:4px}
          .booking-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
          .booking-close{position:absolute;right:18px;top:10px;background:none;border:0;font-size:22px;cursor:pointer}
          .booking-msg{min-height:18px;margin-top:6px;color:#b00020}
        `;
        document.head.appendChild(s);
      }

      document.body.appendChild(overlay);
      return overlay;
    }

    function openModal() {
      if (document.querySelector('.booking-modal')) return; // already open
      const modal = createModal();
      const form = modal.querySelector('.booking-form');
      const close = modal.querySelector('.booking-close');
      const cancel = modal.querySelector('.booking-cancel');
      const msg = modal.querySelector('.booking-msg');
      const barberSelect = modal.querySelector('select[name="barber"]');
      const countrySelect = modal.querySelector('select[name="countryCode"]');
      const countrySearch = modal.querySelector('input[name="countrySearch"]');
      const phoneInput = modal.querySelector('input[name="phone"]');
      const timeSelect = modal.querySelector('select[name="time"]');

      function normalizeTxt(v) {
        return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      }

      function parseMinutes(timeStr) {
        const m = String(timeStr || '').match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return null;
        const hh = Number(m[1]);
        const mm = Number(m[2]);
        if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
        return hh * 60 + mm;
      }

      function formatMinutes(total) {
        const hh = String(Math.floor(total / 60)).padStart(2, '0');
        const mm = String(total % 60).padStart(2, '0');
        return `${hh}:${mm}`;
      }

      function getHoursForDate(dateStr) {
        const fallback = { open: 10 * 60, close: 20 * 60 };
        if (!dateStr) return fallback;
        const d = new Date(`${dateStr}T12:00:00`);
        if (Number.isNaN(d.getTime())) return fallback;

        const dayNames = [
          'niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'
        ];
        const dayName = dayNames[d.getDay()];
        const hoursCfg = cfg.contact && Array.isArray(cfg.contact.hours) ? cfg.contact.hours : [];
        const row = hoursCfg.find(h => normalizeTxt(h.day) === dayName);
        if (!row || !row.hours) return fallback;

        const raw = normalizeTxt(row.hours);
        if (raw.includes('nieczynne') || raw.includes('zamkniete') || raw.includes('closed')) {
          return null;
        }

        const rangeMatch = String(row.hours).match(/(\d{1,2}:\d{2})\s*[\-\u2013\u2014]\s*(\d{1,2}:\d{2})/);
        if (!rangeMatch) return fallback;
        const open = parseMinutes(rangeMatch[1]);
        const close = parseMinutes(rangeMatch[2]);
        if (open === null || close === null || close <= open) return fallback;
        return { open, close };
      }

      function populateTimeOptionsForDate(dateStr) {
        const currentValue = timeSelect.value;
        timeSelect.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Wybierz godzinę';
        timeSelect.appendChild(placeholder);

        const hours = getHoursForDate(dateStr);
        if (!hours) {
          placeholder.textContent = 'Salon nieczynny';
          timeSelect.disabled = true;
          return;
        }

        timeSelect.disabled = false;
        for (let t = hours.open; t < hours.close; t += 15) {
          const value = formatMinutes(t);
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = value;
          timeSelect.appendChild(opt);
        }

        if (currentValue && Array.from(timeSelect.options).some(o => o.value === currentValue)) {
          timeSelect.value = currentValue;
        }
      }

      function applyPhoneConstraints(countryCode) {
        const selected = PHONE_COUNTRIES.find(c => c.code === countryCode);
        if (!selected) {
          phoneInput.removeAttribute('maxlength');
          return;
        }
        phoneInput.maxLength = selected.max;
        phoneInput.setAttribute('maxlength', String(selected.max));
        const digits = normalizeDigits(phoneInput.value);
        phoneInput.value = digits.slice(0, selected.max);
      }

      function renderCountryOptions(filter) {
        const q = String(filter || '').trim().toLowerCase();
        const items = PHONE_COUNTRIES.filter(c => {
          if (!q) return true;
          return c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q);
        });
        countrySelect.innerHTML = '';
        items.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.code;
          opt.textContent = `${c.name} (${c.dial})`;
          countrySelect.appendChild(opt);
        });
        if (items.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = 'Brak wyników';
          countrySelect.appendChild(opt);
          countrySelect.value = '';
          applyPhoneConstraints('');
          return;
        }
        const exists = items.some(c => c.code === 'PL');
        countrySelect.value = exists ? 'PL' : items[0].code;
        applyPhoneConstraints(countrySelect.value);
      }

      // populate barber list
      (cfg.barbers || []).forEach((b, i) => {
        const opt = document.createElement('option'); opt.value = b.name; opt.textContent = b.name; barberSelect.appendChild(opt);
      });

      renderCountryOptions('');
      populateTimeOptionsForDate('');
      countrySearch.addEventListener('input', () => renderCountryOptions(countrySearch.value));
      countrySelect.addEventListener('change', () => applyPhoneConstraints(countrySelect.value));
      phoneInput.addEventListener('input', () => {
        const selected = PHONE_COUNTRIES.find(c => c.code === countrySelect.value);
        const maxDigits = selected ? selected.max : 15;
        const digits = normalizeDigits(phoneInput.value).slice(0, maxDigits);
        phoneInput.value = digits;
      });

      // set min date to today
      const dateInput = form.querySelector('input[name="date"]');
      const today = new Date();
      dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      dateInput.addEventListener('change', () => populateTimeOptionsForDate(dateInput.value));

      close.addEventListener('click', () => modal.remove());
      cancel.addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      form.addEventListener('submit', async (e) => {
        e.preventDefault(); msg.textContent = '';
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const phone = formData.get('phone').trim();
        const countryCode = formData.get('countryCode');
        const country = PHONE_COUNTRIES.find(c => c.code === countryCode);
        const date = formData.get('date');
        const time = formData.get('time');
        const barber = formData.get('barber');
        if (!date || !time) { msg.textContent = 'Wybierz datę i godzinę.'; return; }
        if (!country) { msg.textContent = 'Wybierz kraj z listy.'; return; }

        const phoneCheck = validatePhone(country, phone);
        if (!phoneCheck.ok) { msg.textContent = phoneCheck.message; return; }

        // construct local datetime to check if in future
        const [y,m,d] = date.split('-').map(Number);
        const [hh,mm] = time.split(':').map(Number);
        const dt = new Date(y, m-1, d, hh, mm, 0, 0);
        if (dt < new Date()) { msg.textContent = 'Nie można rezerwować w przeszłości.'; return; }

        // If server API configured, try to POST; otherwise fallback to localStorage
        const apiUrl = cfg.booking && cfg.booking.apiUrl;
        if (apiUrl) {
          try {
            const res = await fetch(apiUrl, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date, time, name, phone: phoneCheck.e164, barber, country: country.code })
            });
            if (res.status === 201) {
              msg.style.color = 'green'; msg.textContent = 'Rezerwacja zapisana. Dziękujemy!';
              setTimeout(() => modal.remove(), 900);
              return;
            } else if (res.status === 409) {
              msg.textContent = 'Ten termin jest już zajęty. Wybierz inny.'; return;
            } else {
              const text = await res.text();
              msg.textContent = 'Błąd serwera: ' + (text || res.status);
              return;
            }
          } catch (err) {
            msg.textContent = 'Błąd połączenia z serwerem. Spróbuj ponownie.'; return;
          }
        }

        // fallback: localStorage
        const isoKey = `${date}T${time}`;
        if (isSlotTaken(isoKey)) { msg.textContent = 'Ten termin jest już zajęty. Wybierz inny.'; return; }
        const bookings = loadBookings();
        bookings.push({ datetime: isoKey, name, phone: phoneCheck.e164, barber, createdAt: new Date().toISOString() });
        saveBookings(bookings);
        msg.style.color = 'green'; msg.textContent = 'Rezerwacja zapisana lokalnie. Dziękujemy!';
        setTimeout(() => modal.remove(), 1200);
      });
    }

    // intercept booking anchors
    bookingAnchors.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault(); openModal();
      });
    });
  })();

  /* ---------------- reveal on scroll -------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(n => io.observe(n));

  /* re-observe elements rendered after initial DOM build (barbers/gallery/reviews) */
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(n => io.observe(n));
  }, 50);
});
