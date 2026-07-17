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
            <label>Telefon<input name="phone" inputmode="tel" required></label>
            <label>Data<input name="date" type="date" required></label>
            <label>Godzina<input name="time" type="time" step="900" required></label>
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

      // populate barber list
      (cfg.barbers || []).forEach((b, i) => {
        const opt = document.createElement('option'); opt.value = b.name; opt.textContent = b.name; barberSelect.appendChild(opt);
      });

      // set min date to today
      const dateInput = form.querySelector('input[name="date"]');
      const today = new Date();
      dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

      close.addEventListener('click', () => modal.remove());
      cancel.addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      form.addEventListener('submit', async (e) => {
        e.preventDefault(); msg.textContent = '';
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const phone = formData.get('phone').trim();
        const date = formData.get('date');
        const time = formData.get('time');
        const barber = formData.get('barber');
        if (!date || !time) { msg.textContent = 'Wybierz datę i godzinę.'; return; }

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
              body: JSON.stringify({ date, time, name, phone, barber })
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
        if (isSlotTaken(isoKey)) { msg.textContent = 'Ten termin jest już zajęty. Wybierz inny.'; return; }
        const bookings = loadBookings();
        bookings.push({ datetime: isoKey, name, phone, barber, createdAt: new Date().toISOString() });
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
