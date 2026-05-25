/* ═══════════════════════════════════════════════════
   Cyber Dreams – Main Website JS
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  initMobileMenu();
  renderServices();
  renderProjects();
  renderReviews();
  renderStats();
  initSlider();
  initFilters();
  initContactForm();
  initScrollAnimations();
  initBackToTop();
});

/* ── LOADER ─────────────────────────────────────── */
function initLoader() {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 500); }
  }, 1300);
}

/* ── NAVBAR ─────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const links  = document.querySelectorAll('.nav-links a, .mobile-menu a[data-section]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveLink();
    document.getElementById('back-to-top')?.classList.toggle('show', window.scrollY > 400);
  });

  links.forEach(link => {
    link.addEventListener('click', e => {
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(target);
        if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        closeMobileMenu();
      }
    });
  });
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

/* ── MOBILE MENU ────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}
function closeMobileMenu() {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('mobile-menu')?.classList.remove('open');
}

/* ── RENDER SERVICES ────────────────────────────── */
function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  const services = DB.getServices();
  if (!services.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%">No services found.</p>'; return; }
  grid.innerHTML = services.map(s => `
    <div class="service-card fade-up">
      ${s.image
        ? `<img src="${s.image}" alt="${s.title}" class="service-img" loading="lazy">`
        : `<div class="service-img-placeholder"><i class="${s.icon || 'fas fa-cog'}"></i></div>`}
      <div class="service-body">
        <div class="service-icon"><i class="${s.icon || 'fas fa-cog'}"></i></div>
        <h3 class="service-title">${s.title}</h3>
        <p class="service-desc">${s.description}</p>
        <span class="service-arrow">Learn More <i class="fas fa-arrow-right"></i></span>
      </div>
    </div>
  `).join('');
  observeFadeElements();
}

/* ── RENDER PROJECTS ────────────────────────────── */
let allProjects = [];
function renderProjects(filter = 'All') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  allProjects = DB.getProjects();
  const filtered = filter === 'All' ? allProjects : allProjects.filter(p => p.category === filter);
  if (!filtered.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%">No projects found.</p>'; return; }
  grid.innerHTML = filtered.map(p => `
    <div class="project-card fade-up" data-category="${p.category || 'Other'}">
      <div class="project-img-wrap">
        ${p.image
          ? `<img src="${p.image}" alt="${p.title}" class="project-img" loading="lazy">`
          : `<div class="project-img-placeholder"><i class="fas fa-folder-open"></i></div>`}
        <div class="project-overlay"><i class="fas fa-eye" style="color:#fff;font-size:1.5rem"></i></div>
        ${p.category ? `<span class="project-category-badge">${p.category}</span>` : ''}
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-meta">
          ${p.client ? `<span><i class="fas fa-building"></i>${p.client}</span>` : ''}
          ${p.year   ? `<span><i class="fas fa-calendar"></i>${p.year}</span>`   : ''}
        </div>
      </div>
    </div>
  `).join('');
  buildFilters();
  observeFadeElements();
}

/* ── PORTFOLIO FILTERS ──────────────────────────── */
function buildFilters() {
  const wrap = document.getElementById('portfolio-filters');
  if (!wrap) return;
  const cats = ['All', ...new Set(allProjects.map(p => p.category).filter(Boolean))];
  wrap.innerHTML = cats.map(c => `<button class="filter-btn${c==='All'?' active':''}" data-cat="${c}">${c}</button>`).join('');
}
function initFilters() {
  const wrap = document.getElementById('portfolio-filters');
  if (!wrap || wrap._filterInit) return;
  wrap._filterInit = true;
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.cat);
  });
}

/* ── RENDER REVIEWS ─────────────────────────────── */
let reviewIdx = 0;
function renderReviews() {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  const reviews = DB.getReviews();
  if (!reviews.length) { track.innerHTML = '<p style="color:var(--text-muted);padding:20px">No reviews yet.</p>'; return; }
  track.innerHTML = reviews.map(r => {
    const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
    const initial = r.name ? r.name.charAt(0).toUpperCase() : 'C';
    return `
      <div class="review-card">
        <div class="review-stars">${stars}</div>
        <p class="review-text">${r.review}</p>
        <div class="reviewer">
          ${r.avatar
            ? `<img src="${r.avatar}" alt="${r.name}" class="reviewer-avatar">`
            : `<div class="reviewer-avatar-placeholder">${initial}</div>`}
          <div>
            <p class="reviewer-name">${r.name}</p>
            <p class="reviewer-company">${r.company || ''}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
  buildSliderDots(reviews.length);
}

/* ── REVIEWS SLIDER ─────────────────────────────── */
function initSlider() {
  document.getElementById('slider-prev')?.addEventListener('click', () => slideReviews(-1));
  document.getElementById('slider-next')?.addEventListener('click', () => slideReviews(1));
  // Auto-play
  setInterval(() => slideReviews(1), 5000);
}
function slideReviews(dir) {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  const cards = track.querySelectorAll('.review-card');
  if (!cards.length) return;
  const visible = getVisibleCount();
  const max = Math.max(0, cards.length - visible);
  reviewIdx = Math.max(0, Math.min(reviewIdx + dir, max));
  const w = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${reviewIdx * w}px)`;
  updateDots();
}
function getVisibleCount() {
  return window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
}
function buildSliderDots(count) {
  const wrap = document.getElementById('slider-dots');
  if (!wrap) return;
  wrap.innerHTML = Array.from({length: count}, (_, i) => `<button class="dot-btn${i===0?' active':''}" data-i="${i}"></button>`).join('');
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.dot-btn');
    if (!btn) return;
    reviewIdx = parseInt(btn.dataset.i);
    const track = document.getElementById('reviews-track');
    const cards = track?.querySelectorAll('.review-card');
    if (!cards || !cards.length) return;
    const w = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${reviewIdx * w}px)`;
    updateDots();
  });
}
function updateDots() {
  document.querySelectorAll('.dot-btn').forEach((d, i) => d.classList.toggle('active', i === reviewIdx));
}

/* ── RENDER STATS ───────────────────────────────── */
function renderStats() {
  const stats = DB.getStats();
  const map = { cd_stat_projects: stats.projects, cd_stat_clients: stats.clients, cd_stat_years: stats.years, cd_stat_satisfaction: stats.satisfaction };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ── CONTACT FORM ───────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    DB.saveMessage(data);
    showToast('Message sent! We\'ll get back to you soon.', 'success');
    form.reset();
    const success = document.getElementById('form-success');
    if (success) { success.style.display = 'block'; setTimeout(() => success.style.display = 'none', 4000); }
  });
}

/* ── SCROLL ANIMATIONS ──────────────────────────── */
function initScrollAnimations() {
  observeFadeElements();
}
function observeFadeElements() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => io.observe(el));
}

/* ── BACK TO TOP ────────────────────────────────── */
function initBackToTop() {
  document.getElementById('back-to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.className = `${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

window.addEventListener('resize', () => slideReviews(0));
