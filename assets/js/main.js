/* ═══════════════════════════════════════════════════
   Cyber Dreams – Main Website JS  (API-powered)
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initBackToTop();
  initVideoLightbox();
  initFilters();

  await Promise.all([
    renderServices(),
    renderProjects(),
    renderReviews(),
    renderStats(),
    renderVideos(),
  ]);

  initContactForm();
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
async function renderServices() {
  const grid = document.getElementById('services-grid');
  if (!grid) return;
  try {
    const [all, showcase] = await Promise.all([
      API.getServices(),
      API.getShowcase('services'),
    ]);
    const limit = 6;
    const idMap = Object.fromEntries(all.map(s => [s.id, s]));
    const services = showcase.length
      ? showcase.slice(0, limit).map(s => idMap[s.id] || s).filter(Boolean)
      : all.slice(0, limit);
    if (!services.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%">No services found.</p>'; return; }
    grid.innerHTML = services.map(s => `
      <div class="service-card fade-up">
        ${s.image ? `<img src="${s.image}" alt="${s.title}" class="service-img" loading="lazy">` : `<div class="service-img-placeholder"><i class="${s.icon || 'fas fa-cog'}"></i></div>`}
        <div class="service-body">
          <div class="service-icon"><i class="${s.icon || 'fas fa-cog'}"></i></div>
          <h3 class="service-title">${s.title}</h3>
          <p class="service-desc">${s.description || ''}</p>
          <span class="service-arrow">Learn More <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    `).join('');
    const more = document.getElementById('services-view-more');
    if (more) more.style.display = all.length > 0 ? 'flex' : 'none';
    observeFadeElements();
  } catch (e) { console.error('renderServices:', e); }
}

/* ── RENDER PROJECTS ────────────────────────────── */
let allProjects = [];
async function renderProjects(filter = 'All') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    if (filter === 'All') {
      const [all, showcase] = await Promise.all([
        API.getProjects(),
        API.getShowcase('projects'),
      ]);
      allProjects = all;
      const idMap = Object.fromEntries(all.map(p => [p.id, p]));
      const showcased = showcase.length
        ? showcase.slice(0, 6).map(p => idMap[p.id] || p).filter(Boolean)
        : all.slice(0, 6);
      _renderProjectCards(showcased);
      const more = document.getElementById('projects-view-more');
      if (more) more.style.display = all.length > 0 ? 'flex' : 'none';
    } else {
      const filtered = allProjects.filter(p => p.category === filter).slice(0, 6);
      _renderProjectCards(filtered);
    }
    buildFilters();
    observeFadeElements();
  } catch (e) { console.error('renderProjects:', e); }
}
function _renderProjectCards(list) {
  const grid = document.getElementById('projects-grid');
  if (!list.length) { grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%">No projects found.</p>'; return; }
  grid.innerHTML = list.map(p => `
    <div class="project-card fade-up" data-category="${p.category || 'Other'}">
      <div class="project-img-wrap">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" class="project-img" loading="lazy">` : `<div class="project-img-placeholder"><i class="fas fa-folder-open"></i></div>`}
        <div class="project-overlay"><i class="fas fa-eye" style="color:#fff;font-size:1.5rem"></i></div>
        ${p.category ? `<span class="project-category-badge">${p.category}</span>` : ''}
      </div>
      <div class="project-body">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description || ''}</p>
        <div class="project-meta">
          ${p.client ? `<span><i class="fas fa-building"></i>${p.client}</span>` : ''}
          ${p.year   ? `<span><i class="fas fa-calendar"></i>${p.year}</span>`   : ''}
        </div>
      </div>
    </div>
  `).join('');
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
async function renderReviews() {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  try {
    const reviews = await API.getReviews();
    if (!reviews.length) { track.innerHTML = '<p style="color:var(--text-muted);padding:20px">No reviews yet.</p>'; return; }
    track.innerHTML = reviews.map(r => {
      const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
      const initial = r.name ? r.name.charAt(0).toUpperCase() : 'C';
      return `
        <div class="review-card">
          <div class="review-stars">${stars}</div>
          <p class="review-text">${r.review}</p>
          <div class="reviewer">
            ${r.avatar ? `<img src="${r.avatar}" alt="${r.name}" class="reviewer-avatar">` : `<div class="reviewer-avatar-placeholder">${initial}</div>`}
            <div>
              <p class="reviewer-name">${r.name}</p>
              <p class="reviewer-company">${r.company || ''}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
    buildSliderDots(reviews.length);
    initSlider();
  } catch (e) { console.error('renderReviews:', e); }
}

/* ── REVIEWS SLIDER ─────────────────────────────── */
function initSlider() {
  const prev = document.getElementById('slider-prev');
  const next = document.getElementById('slider-next');
  if (prev && !prev._bound) { prev._bound = true; prev.addEventListener('click', () => slideReviews(-1)); }
  if (next && !next._bound) { next._bound = true; next.addEventListener('click', () => slideReviews(1)); }
  if (!window._sliderInterval) window._sliderInterval = setInterval(() => slideReviews(1), 5000);
}
function slideReviews(dir) {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  const cards = track.querySelectorAll('.review-card');
  if (!cards.length) return;
  const visible = window.innerWidth >= 900 ? 3 : window.innerWidth >= 600 ? 2 : 1;
  const max = Math.max(0, cards.length - visible);
  reviewIdx = Math.max(0, Math.min(reviewIdx + dir, max));
  const w = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${reviewIdx * w}px)`;
  document.querySelectorAll('.dot-btn').forEach((d, i) => d.classList.toggle('active', i === reviewIdx));
}
function buildSliderDots(count) {
  const wrap = document.getElementById('slider-dots');
  if (!wrap) return;
  wrap.innerHTML = Array.from({length: count}, (_, i) => `<button class="dot-btn${i===0?' active':''}" data-i="${i}"></button>`).join('');
  if (!wrap._bound) {
    wrap._bound = true;
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.dot-btn');
      if (!btn) return;
      reviewIdx = parseInt(btn.dataset.i);
      slideReviews(0);
    });
  }
}

/* ── RENDER STATS ───────────────────────────────── */
async function renderStats() {
  try {
    const s = await API.getSettings();
    const map = {
      cd_stat_projects:     s.statProjects     || s.projects,
      cd_stat_clients:      s.statClients      || s.clients,
      cd_stat_years:        s.statYears        || s.years,
      cd_stat_satisfaction: s.statSatisfaction || s.satisfaction,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    });
  } catch (e) { console.error('renderStats:', e); }
}

/* ── CONTACT FORM ───────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    if (btn) btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      await API.sendMessage(data);
      showToast("Message sent! We'll get back to you soon.", 'success');
      form.reset();
      const success = document.getElementById('form-success');
      if (success) { success.style.display = 'block'; setTimeout(() => success.style.display = 'none', 4000); }
    } catch (err) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
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

/* ── RENDER VIDEOS ─────────────────────────────── */
async function renderVideos() {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;
  try {
    const [all, showcase] = await Promise.all([
      API.getVideos(),
      API.getShowcase('videos'),
    ]);
    const limit = 5;
    const idMap = Object.fromEntries(all.map(v => [v.id, v]));
    const videos = showcase.length
      ? showcase.slice(0, limit).map(v => idMap[v.id] || v).filter(Boolean)
      : all.slice(0, limit);
    if (!videos.length) {
      grid.innerHTML = '<div class="video-empty"><i class="fab fa-youtube"></i><p>No videos yet. Check back soon!</p></div>';
      const more = document.getElementById('videos-view-more');
      if (more) more.style.display = 'none';
      return;
    }
    grid.innerHTML = videos.map(v => {
      const ytId = API.extractYouTubeId(v.url);
      const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : '';
      return `
        <div class="video-card fade-up" data-ytid="${ytId || ''}" data-title="${v.title || ''}">
          ${thumb ? `<img src="${thumb}" class="video-thumb" alt="${v.title || 'Video'}" loading="lazy">` : `<div class="video-thumb-placeholder"><i class="fab fa-youtube"></i></div>`}
          <div class="video-overlay">
            <div class="video-title">${v.title || 'Watch Video'}</div>
            ${v.label ? `<div class="video-label">${v.label}</div>` : ''}
          </div>
          <div class="video-play-btn"><i class="fas fa-play"></i></div>
        </div>
      `;
    }).join('');
    const more = document.getElementById('videos-view-more');
    if (more) more.style.display = all.length > 0 ? 'flex' : 'none';
    observeFadeElements();
    grid.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', () => openVideoLightbox(card.dataset.ytid, card.dataset.title));
    });
  } catch (e) { console.error('renderVideos:', e); }
}

/* ── VIDEO LIGHTBOX ────────────────────────────── */
function initVideoLightbox() {
  const lb    = document.getElementById('video-lightbox');
  const close = document.getElementById('video-lightbox-close');
  if (!lb) return;
  close?.addEventListener('click', closeVideoLightbox);
  lb.addEventListener('click', e => { if (e.target === lb) closeVideoLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoLightbox(); });
}
function openVideoLightbox(ytId, title) {
  if (!ytId) return;
  const lb     = document.getElementById('video-lightbox');
  const iframe = document.getElementById('video-lightbox-iframe');
  if (!lb || !iframe) return;
  iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVideoLightbox() {
  const lb     = document.getElementById('video-lightbox');
  const iframe = document.getElementById('video-lightbox-iframe');
  if (lb)     lb.classList.remove('open');
  if (iframe) iframe.src = '';
  document.body.style.overflow = '';
}
