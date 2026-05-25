/* ═══════════════════════════════════════════════════
   Cyber Dreams – Admin Panel JS
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

/* ── AUTH ─────────────────────────────────────────── */
function checkAuth() {
  if (sessionStorage.getItem('cd_admin_auth') === '1') {
    showAdminApp();
  } else {
    document.getElementById('login-screen').style.display = 'flex';
  }
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const pass = document.getElementById('login-pass').value;
    const settings = DB.getSettings();
    if (pass === settings.adminPassword) {
      sessionStorage.setItem('cd_admin_auth', '1');
      document.getElementById('login-screen').style.display = 'none';
      showAdminApp();
    } else {
      document.getElementById('login-error').textContent = 'Incorrect password. Try again.';
    }
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('cd_admin_auth');
    location.reload();
  });
}

function showAdminApp() {
  const app = document.getElementById('admin-app');
  app.classList.add('visible');
  initSidebar();
  initNavigation();
  renderDashboard();
  showPage('dashboard');
}

/* ── SIDEBAR ──────────────────────────────────────── */
function initSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn  = document.getElementById('sidebar-close');
  const sidebar   = document.querySelector('.sidebar');
  toggleBtn?.addEventListener('click', () => sidebar.classList.toggle('open'));
  closeBtn?.addEventListener('click',  () => sidebar.classList.remove('open'));
  document.addEventListener('click', e => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── NAVIGATION ───────────────────────────────────── */
function initNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      showPage(page);
      document.querySelector('.sidebar')?.classList.remove('open');
    });
  });
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${name}`)?.classList.add('active');
  document.querySelector(`.nav-item[data-page="${name}"]`)?.classList.add('active');
  document.querySelector('.top-bar-title').textContent = getTitleForPage(name);

  const renders = {
    dashboard: renderDashboard,
    services:  renderServicesPage,
    projects:  renderProjectsPage,
    reviews:   renderReviewsPage,
    messages:  renderMessagesPage,
    settings:  renderSettingsPage,
  };
  renders[name]?.();
  updateMsgBadge();
}

function getTitleForPage(name) {
  const map = { dashboard: 'Dashboard', services: 'Services', projects: 'Projects', reviews: 'Client Reviews', messages: 'Messages', settings: 'Settings' };
  return map[name] || 'Admin Panel';
}

/* ── DASHBOARD ────────────────────────────────────── */
function renderDashboard() {
  const services = DB.getServices();
  const projects = DB.getProjects();
  const reviews  = DB.getReviews();
  const messages = DB.getMessages();
  const unread   = messages.filter(m => !m.read).length;

  setEl('dash-services', services.length);
  setEl('dash-projects', projects.length);
  setEl('dash-reviews',  reviews.length);
  setEl('dash-messages', messages.length);
  setEl('dash-unread',   unread ? `${unread} unread` : 'All read');

  // Recent messages
  const recents = messages.slice(0, 5);
  const el = document.getElementById('dash-recent-msgs');
  if (el) {
    el.innerHTML = recents.length ? recents.map(m => `
      <tr>
        <td><strong>${esc(m.name || '—')}</strong></td>
        <td>${esc(m.subject || '—')}</td>
        <td>${esc(m.service || '—')}</td>
        <td>${formatDate(m.createdAt)}</td>
        <td>${m.read ? '<span class="badge badge-gray">Read</span>' : '<span class="badge badge-orange">New</span>'}</td>
      </tr>
    `).join('') : `<tr><td colspan="5" class="empty-state" style="text-align:center;color:var(--text-muted);padding:20px">No messages yet</td></tr>`;
  }
}

/* ── SERVICES PAGE ────────────────────────────────── */
function renderServicesPage() {
  const services = DB.getServices();
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;
  tbody.innerHTML = services.length ? services.map(s => `
    <tr>
      <td>${s.image ? `<img src="${s.image}" class="data-table-img" alt="${esc(s.title)}">` : `<div class="data-table-img-placeholder"><i class="${s.icon || 'fas fa-cog'}"></i></div>`}</td>
      <td><strong>${esc(s.title)}</strong></td>
      <td><code style="font-size:0.75rem;color:var(--orange)">${esc(s.icon || '')}</code></td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.description)}</td>
      <td>${s.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editService('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('service','${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-cog"></i><p>No services yet. Add your first service!</p></div></td></tr>`;
}

function openAddService() {
  openModal('service-modal');
  document.getElementById('service-form').reset();
  document.getElementById('service-modal-title').textContent = 'Add Service';
  document.getElementById('service-id').value = '';
  document.getElementById('service-featured').classList.remove('on');
  hideEl('service-img-preview');
}

function editService(id) {
  const s = DB.getServices().find(x => x.id === id);
  if (!s) return;
  openModal('service-modal');
  document.getElementById('service-modal-title').textContent = 'Edit Service';
  document.getElementById('service-id').value = s.id;
  document.getElementById('service-title-inp').value = s.title || '';
  document.getElementById('service-icon-inp').value = s.icon || '';
  document.getElementById('service-desc-inp').value = s.description || '';
  document.getElementById('service-img-inp').value = s.image || '';
  toggleClass('service-featured', 'on', !!s.featured);
  if (s.image) { showImgPreview('service-img-preview', s.image); } else { hideEl('service-img-preview'); }
}

document.addEventListener('click', e => {
  if (e.target.id === 'add-service-btn') openAddService();
  if (e.target.id === 'save-service-btn') saveServiceForm();
});

function saveServiceForm() {
  const id    = val('service-id');
  const title = val('service-title-inp');
  if (!title) { adminToast('Service title is required', 'error'); return; }
  const service = {
    id:          id || undefined,
    title,
    icon:        val('service-icon-inp') || 'fas fa-cog',
    description: val('service-desc-inp'),
    image:       val('service-img-inp'),
    featured:    document.getElementById('service-featured')?.classList.contains('on'),
  };
  DB.saveService(service);
  closeModal('service-modal');
  renderServicesPage();
  adminToast(id ? 'Service updated!' : 'Service added!', 'success');
}

/* ── PROJECTS PAGE ────────────────────────────────── */
function renderProjectsPage() {
  const projects = DB.getProjects();
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;
  tbody.innerHTML = projects.length ? projects.map(p => `
    <tr>
      <td>${p.image ? `<img src="${p.image}" class="data-table-img" alt="${esc(p.title)}">` : `<div class="data-table-img-placeholder"><i class="fas fa-folder"></i></div>`}</td>
      <td><strong>${esc(p.title)}</strong></td>
      <td><span class="badge badge-blue">${esc(p.category || '—')}</span></td>
      <td>${esc(p.client || '—')}</td>
      <td>${esc(p.year || '—')}</td>
      <td>${p.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editProject('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('project','${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Add your first project!</p></div></td></tr>`;
}

function openAddProject() {
  openModal('project-modal');
  document.getElementById('project-form').reset();
  document.getElementById('project-modal-title').textContent = 'Add Project';
  document.getElementById('project-id').value = '';
  document.getElementById('project-featured').classList.remove('on');
  hideEl('project-img-preview');
}

function editProject(id) {
  const p = DB.getProjects().find(x => x.id === id);
  if (!p) return;
  openModal('project-modal');
  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('project-id').value = p.id;
  document.getElementById('project-title-inp').value = p.title || '';
  document.getElementById('project-category-inp').value = p.category || '';
  document.getElementById('project-client-inp').value = p.client || '';
  document.getElementById('project-year-inp').value = p.year || '';
  document.getElementById('project-desc-inp').value = p.description || '';
  document.getElementById('project-img-inp').value = p.image || '';
  toggleClass('project-featured', 'on', !!p.featured);
  if (p.image) { showImgPreview('project-img-preview', p.image); } else { hideEl('project-img-preview'); }
}

document.addEventListener('click', e => {
  if (e.target.id === 'add-project-btn') openAddProject();
  if (e.target.id === 'save-project-btn') saveProjectForm();
});

function saveProjectForm() {
  const id    = val('project-id');
  const title = val('project-title-inp');
  if (!title) { adminToast('Project title is required', 'error'); return; }
  const project = {
    id:          id || undefined,
    title,
    category:    val('project-category-inp'),
    client:      val('project-client-inp'),
    year:        val('project-year-inp'),
    description: val('project-desc-inp'),
    image:       val('project-img-inp'),
    featured:    document.getElementById('project-featured')?.classList.contains('on'),
  };
  DB.saveProject(project);
  closeModal('project-modal');
  renderProjectsPage();
  adminToast(id ? 'Project updated!' : 'Project added!', 'success');
}

/* ── REVIEWS PAGE ─────────────────────────────────── */
function renderReviewsPage() {
  const reviews = DB.getReviews();
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;
  tbody.innerHTML = reviews.length ? reviews.map(r => `
    <tr>
      <td><strong>${esc(r.name)}</strong></td>
      <td>${esc(r.company || '—')}</td>
      <td>${'★'.repeat(r.rating || 5)}</td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;color:var(--text-muted)">${esc(r.review)}</td>
      <td>${r.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editReview('${r.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('review','${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-star"></i><p>No reviews yet. Add a client review!</p></div></td></tr>`;
}

function openAddReview() {
  openModal('review-modal');
  document.getElementById('review-form').reset();
  document.getElementById('review-modal-title').textContent = 'Add Review';
  document.getElementById('review-id').value = '';
  document.getElementById('review-featured').classList.remove('on');
  setStars(5);
}

function editReview(id) {
  const r = DB.getReviews().find(x => x.id === id);
  if (!r) return;
  openModal('review-modal');
  document.getElementById('review-modal-title').textContent = 'Edit Review';
  document.getElementById('review-id').value = r.id;
  document.getElementById('review-name-inp').value = r.name || '';
  document.getElementById('review-company-inp').value = r.company || '';
  document.getElementById('review-text-inp').value = r.review || '';
  toggleClass('review-featured', 'on', !!r.featured);
  setStars(r.rating || 5);
}

document.addEventListener('click', e => {
  if (e.target.id === 'add-review-btn') openAddReview();
  if (e.target.id === 'save-review-btn') saveReviewForm();
});

function saveReviewForm() {
  const id   = val('review-id');
  const name = val('review-name-inp');
  if (!name) { adminToast('Reviewer name is required', 'error'); return; }
  const review = {
    id:       id || undefined,
    name,
    company:  val('review-company-inp'),
    review:   val('review-text-inp'),
    rating:   parseInt(document.querySelector('.star-btn.active')?.dataset?.star || '5'),
    featured: document.getElementById('review-featured')?.classList.contains('on'),
  };
  DB.saveReview(review);
  closeModal('review-modal');
  renderReviewsPage();
  adminToast(id ? 'Review updated!' : 'Review added!', 'success');
}

/* Star rating widget */
function initStarWidget() {
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => setStars(parseInt(btn.dataset.star)));
    btn.addEventListener('mouseover', () => hoverStars(parseInt(btn.dataset.star)));
    btn.addEventListener('mouseout', () => {
      const current = parseInt(document.querySelector('.star-btn.active')?.dataset?.star || '5');
      setStars(current);
    });
  });
}
function setStars(n) {
  document.querySelectorAll('.star-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.star) <= n);
  });
}
function hoverStars(n) {
  document.querySelectorAll('.star-btn').forEach(b => {
    b.style.color = parseInt(b.dataset.star) <= n ? 'var(--orange)' : 'var(--dark-5)';
  });
}

/* ── MESSAGES PAGE ────────────────────────────────── */
function renderMessagesPage() {
  const messages = DB.getMessages();
  const el = document.getElementById('messages-list');
  if (!el) return;
  if (!messages.length) {
    el.innerHTML = '<div class="empty-state" style="padding:48px 20px"><i class="fas fa-inbox" style="font-size:2.5rem;color:var(--dark-5);display:block;margin-bottom:12px"></i><p>No messages yet.</p></div>';
    return;
  }
  el.innerHTML = messages.map(m => `
    <div class="msg-card${m.read ? '' : ' unread'}" onclick="openMessage('${m.id}')">
      <div class="msg-header">
        <div class="msg-avatar">${(m.name || 'U').charAt(0).toUpperCase()}</div>
        <div style="flex:1">
          <div class="msg-from">${esc(m.name || 'Unknown')}</div>
          <div class="msg-email">${esc(m.email || '')}</div>
        </div>
        ${!m.read ? '<div class="unread-dot"></div>' : ''}
        <div class="msg-time">${formatDate(m.createdAt)}</div>
        <button class="btn btn-danger btn-sm btn-icon" style="margin-left:8px" onclick="event.stopPropagation();deleteMessage('${m.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
      <div class="msg-subject">${esc(m.subject || 'No subject')}</div>
      <div class="msg-preview">${esc((m.message || '').substring(0, 120))}${(m.message || '').length > 120 ? '...' : ''}</div>
      ${m.service ? `<div style="margin-top:8px"><span class="badge badge-orange">${esc(m.service)}</span></div>` : ''}
    </div>
  `).join('');
  updateMsgBadge();
}

function openMessage(id) {
  DB.markMessageRead(id);
  const m = DB.getMessages().find(x => x.id === id);
  if (!m) return;
  document.getElementById('msg-view-from').textContent    = m.name || '—';
  document.getElementById('msg-view-email').textContent   = m.email || '—';
  document.getElementById('msg-view-phone').textContent   = m.phone || '—';
  document.getElementById('msg-view-service').textContent = m.service || '—';
  document.getElementById('msg-view-subject').textContent = m.subject || '—';
  document.getElementById('msg-view-body').textContent    = m.message || '—';
  document.getElementById('msg-view-time').textContent    = m.createdAt ? new Date(m.createdAt).toLocaleString() : '—';
  document.getElementById('msg-delete-btn').onclick = () => { deleteMessage(id); closeModal('msg-modal'); };
  openModal('msg-modal');
  renderMessagesPage();
}

function deleteMessage(id) {
  DB.deleteMessage(id);
  renderMessagesPage();
  adminToast('Message deleted', 'info');
}

function updateMsgBadge() {
  const unread = DB.getMessages().filter(m => !m.read).length;
  document.querySelectorAll('.msg-badge').forEach(el => {
    el.textContent = unread;
    el.style.display = unread ? 'inline' : 'none';
  });
}

/* ── SETTINGS PAGE ────────────────────────────────── */
function renderSettingsPage() {
  const settings = DB.getSettings();
  const stats    = DB.getStats();
  setVal('settings-hero-title',    settings.heroTitle || '');
  setVal('settings-hero-subtitle', settings.heroSubtitle || '');
  setVal('settings-stat-projects', stats.projects || '');
  setVal('settings-stat-clients',  stats.clients || '');
  setVal('settings-stat-years',    stats.years || '');
  setVal('settings-stat-sat',      stats.satisfaction || '');
}

document.addEventListener('click', e => {
  if (e.target.id === 'save-settings-btn') {
    DB.saveSettings({
      ...DB.getSettings(),
      heroTitle:    val('settings-hero-title'),
      heroSubtitle: val('settings-hero-subtitle'),
    });
    DB.saveStats({
      projects:     val('settings-stat-projects'),
      clients:      val('settings-stat-clients'),
      years:        val('settings-stat-years'),
      satisfaction: val('settings-stat-sat'),
    });
    adminToast('Settings saved!', 'success');
  }
  if (e.target.id === 'change-pass-btn') {
    const errEl  = document.getElementById('pass-change-error');
    const showErr = msg => { if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } };
    const clearErr = () => { if (errEl) errEl.style.display = 'none'; };
    const cur = val('current-password');
    const np  = val('new-password');
    const cp  = val('confirm-password');
    clearErr();
    if (!cur) { showErr('Please enter your current password.'); return; }
    if (cur !== DB.getSettings().adminPassword) { showErr('Current password is incorrect.'); document.getElementById('current-password').value = ''; return; }
    if (!np) { showErr('New password cannot be empty.'); return; }
    if (np.length < 6) { showErr('New password must be at least 6 characters.'); return; }
    if (np !== cp) { showErr('New passwords do not match.'); return; }
    DB.saveSettings({ ...DB.getSettings(), adminPassword: np });
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    clearErr();
    adminToast('Password changed successfully!', 'success');
  }
  if (e.target.id === 'clear-messages-btn') {
    if (confirm('Clear all messages? This cannot be undone.')) {
      localStorage.removeItem(DB.KEYS.MESSAGES);
      renderMessagesPage();
      adminToast('All messages cleared', 'info');
    }
  }
  if (e.target.id === 'reset-data-btn') {
    if (confirm('Reset ALL data to defaults? This cannot be undone!')) {
      Object.values(DB.KEYS).forEach(k => localStorage.removeItem(k));
      DB.seed();
      adminToast('Data reset to defaults', 'info');
      renderDashboard();
    }
  }
});

/* ── IMAGE URL PREVIEW ────────────────────────────── */
document.addEventListener('input', e => {
  if (e.target.id === 'service-img-inp') { previewImgFromInput('service-img-inp', 'service-img-preview'); }
  if (e.target.id === 'project-img-inp') { previewImgFromInput('project-img-inp', 'project-img-preview'); }
});

function previewImgFromInput(inputId, previewId) {
  const url = val(inputId);
  if (url) showImgPreview(previewId, url); else hideEl(previewId);
}

/* ── TOGGLE FEATURED ──────────────────────────────── */
document.addEventListener('click', e => {
  if (e.target.classList.contains('toggle') || e.target.closest('.toggle')) {
    const t = e.target.classList.contains('toggle') ? e.target : e.target.closest('.toggle');
    t.classList.toggle('on');
  }
});

/* ── DELETE CONFIRM ───────────────────────────────── */
let _pendingDelete = null;
function confirmDelete(type, id) {
  _pendingDelete = { type, id };
  document.getElementById('confirm-delete-type').textContent = type;
  openModal('confirm-modal');
}
document.addEventListener('click', e => {
  if (e.target.id === 'confirm-delete-btn') {
    if (!_pendingDelete) return;
    const { type, id } = _pendingDelete;
    if (type === 'service') { DB.deleteService(id); renderServicesPage(); }
    if (type === 'project') { DB.deleteProject(id); renderProjectsPage(); }
    if (type === 'review')  { DB.deleteReview(id);  renderReviewsPage();  }
    closeModal('confirm-modal');
    adminToast(`${capitalize(type)} deleted`, 'info');
    _pendingDelete = null;
    renderDashboard();
  }
});

/* ── MODAL HELPERS ────────────────────────────────── */
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    e.target.closest('.modal-overlay')?.classList.remove('open');
  }
  if (e.target.id === 'confirm-cancel-btn') closeModal('confirm-modal');
});

/* ── TOAST ────────────────────────────────────────── */
function adminToast(msg, type = 'success') {
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', info: 'fas fa-info-circle' };
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.querySelector('.toast-icon').className = `toast-icon ${icons[type] || icons.success}`;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.className = `${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── UTILS ────────────────────────────────────────── */
function val(id)      { return (document.getElementById(id)?.value || '').trim(); }
function setVal(id,v) { const el = document.getElementById(id); if (el) el.value = v; }
function setEl(id,v)  { const el = document.getElementById(id); if (el) el.textContent = v; }
function hideEl(id)   { const el = document.getElementById(id); if (el) el.classList.remove('show'); }
function showImgPreview(id, src) { const el = document.getElementById(id); if (el) { el.src = src; el.classList.add('show'); } }
function toggleClass(id, cls, force) { document.getElementById(id)?.classList.toggle(cls, force); }
function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

document.addEventListener('DOMContentLoaded', initStarWidget);
