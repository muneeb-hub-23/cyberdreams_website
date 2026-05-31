/* ═══════════════════════════════════════════════════
   Cyber Dreams – Admin Panel JS  (API-powered)
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const me = await API.getMe();
    if (me.admin) {
      showAdminApp();
    } else {
      document.getElementById('login-screen').style.display = 'flex';
    }
  } catch {
    document.getElementById('login-screen').style.display = 'flex';
  }

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn  = e.target.querySelector('button[type=submit]');
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    if (btn) btn.disabled = true;
    try {
      await API.login(pass);
      document.getElementById('login-screen').style.display = 'none';
      showAdminApp();
    } catch {
      if (errEl) errEl.textContent = 'Incorrect password. Try again.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await API.logout();
    location.reload();
  });
});

function showAdminApp() {
  const app = document.getElementById('admin-app');
  app.classList.add('visible');
  initSidebar();
  initNavigation();
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
    videos:    renderVideosPage,
    showcase:  renderShowcasePage,
    messages:  renderMessagesPage,
    settings:  renderSettingsPage,
  };
  renders[name]?.();
  updateMsgBadge();
}

function getTitleForPage(name) {
  const map = { dashboard: 'Dashboard', services: 'Services', projects: 'Projects', reviews: 'Client Reviews', videos: 'Videos', showcase: 'Homepage Showcase', messages: 'Messages', settings: 'Settings' };
  return map[name] || 'Admin Panel';
}

/* ── DASHBOARD ────────────────────────────────────── */
async function renderDashboard() {
  try {
    const [services, projects, reviews, messages, videos] = await Promise.all([
      API.getServices(), API.getProjects(), API.getReviews(), API.getMessages(), API.getVideos(),
    ]);
    const unread = messages.filter(m => !m.read).length;

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
  updateMsgBadge(unread);
  } catch(err) { console.error('renderDashboard:', err); }
}

/* ── SERVICES PAGE ────────────────────────────────── */
let _services = [];
async function renderServicesPage() {
  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;
  try {
    _services = await API.getServices();
    tbody.innerHTML = _services.length ? _services.map(s => `
      <tr>
        <td>${s.image ? `<img src="${s.image}" class="data-table-img" alt="${esc(s.title)}">` : `<div class="data-table-img-placeholder"><i class="${s.icon || 'fas fa-cog'}"></i></div>`}</td>
        <td><strong>${esc(s.title)}</strong></td>
        <td><code style="font-size:0.75rem;color:var(--orange)">${esc(s.icon || '')}</code></td>
        <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(s.description || '')}</td>
        <td>${s.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
        <td><div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editService('${s.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('service','${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>
    `).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-cog"></i><p>No services yet.</p></div></td></tr>`;
  } catch(err) { adminToast('Failed to load services', 'error'); }
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
  const s = _services.find(x => x.id === id);
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

async function saveServiceForm() {
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
  try {
    await API.saveService(service);
    closeModal('service-modal');
    await renderServicesPage();
    adminToast(id ? 'Service updated!' : 'Service added!', 'success');
  } catch(err) { adminToast('Failed to save service: ' + err.message, 'error'); }
}

/* ── PROJECTS PAGE ────────────────────────────────── */
let _projects = [];
async function renderProjectsPage() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;
  try {
    _projects = await API.getProjects();
    tbody.innerHTML = _projects.length ? _projects.map(p => `
      <tr>
        <td>${p.image ? `<img src="${p.image}" class="data-table-img" alt="${esc(p.title)}">` : `<div class="data-table-img-placeholder"><i class="fas fa-folder"></i></div>`}</td>
        <td><strong>${esc(p.title)}</strong></td>
        <td><span class="badge badge-blue">${esc(p.category || '—')}</span></td>
        <td>${esc(p.client || '—')}</td>
        <td>${esc(p.year || '—')}</td>
        <td>${p.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
        <td><div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editProject('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('project','${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>
    `).join('') : `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet.</p></div></td></tr>`;
  } catch(err) { adminToast('Failed to load projects', 'error'); }
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
  const p = _projects.find(x => x.id === id);
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

async function saveProjectForm() {
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
  try {
    await API.saveProject(project);
    closeModal('project-modal');
    await renderProjectsPage();
    adminToast(id ? 'Project updated!' : 'Project added!', 'success');
  } catch(err) { adminToast('Failed to save project: ' + err.message, 'error'); }
}

/* ── REVIEWS PAGE ─────────────────────────────────── */
let _reviews = [];
async function renderReviewsPage() {
  const tbody = document.getElementById('reviews-tbody');
  if (!tbody) return;
  try {
    _reviews = await API.getReviews();
    tbody.innerHTML = _reviews.length ? _reviews.map(r => `
      <tr>
        <td><strong>${esc(r.name)}</strong></td>
        <td>${esc(r.company || '—')}</td>
        <td>${'★'.repeat(r.rating || 5)}</td>
        <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;color:var(--text-muted)">${esc(r.review || '')}</td>
        <td>${r.featured ? '<span class="badge badge-orange">Featured</span>' : '<span class="badge badge-gray">Hidden</span>'}</td>
        <td><div class="actions-cell">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editReview('${r.id}')" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="confirmDelete('review','${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>
    `).join('') : `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-star"></i><p>No reviews yet.</p></div></td></tr>`;
  } catch(err) { adminToast('Failed to load reviews', 'error'); }
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
  const r = _reviews.find(x => x.id === id);
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

async function saveReviewForm() {
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
  try {
    await API.saveReview(review);
    closeModal('review-modal');
    await renderReviewsPage();
    adminToast(id ? 'Review updated!' : 'Review added!', 'success');
  } catch(err) { adminToast('Failed to save review: ' + err.message, 'error'); }
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
let _messages = [];
async function renderMessagesPage() {
  const el = document.getElementById('messages-list');
  if (!el) return;
  try {
    _messages = await API.getMessages();
    if (!_messages.length) {
      el.innerHTML = '<div class="empty-state" style="padding:48px 20px"><i class="fas fa-inbox" style="font-size:2.5rem;color:var(--dark-5);display:block;margin-bottom:12px"></i><p>No messages yet.</p></div>';
      return;
    }
    el.innerHTML = _messages.map(m => `
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
    updateMsgBadge(_messages.filter(m => !m.read).length);
  } catch(err) { adminToast('Failed to load messages', 'error'); }
}

async function openMessage(id) {
  try {
    await API.markMessageRead(id);
    const m = _messages.find(x => x.id === id);
    if (!m) return;
    m.read = true;
    document.getElementById('msg-view-from').textContent    = m.name || '—';
    document.getElementById('msg-view-email').textContent   = m.email || '—';
    document.getElementById('msg-view-phone').textContent   = m.phone || '—';
    document.getElementById('msg-view-service').textContent = m.service || '—';
    document.getElementById('msg-view-subject').textContent = m.subject || '—';
    document.getElementById('msg-view-body').textContent    = m.message || '—';
    document.getElementById('msg-view-time').textContent    = m.createdAt ? new Date(m.createdAt).toLocaleString() : '—';
    document.getElementById('msg-delete-btn').onclick = () => { deleteMessage(id); closeModal('msg-modal'); };
    openModal('msg-modal');
    await renderMessagesPage();
  } catch(err) { adminToast('Error opening message', 'error'); }
}

async function deleteMessage(id) {
  try {
    await API.deleteMessage(id);
    await renderMessagesPage();
    adminToast('Message deleted', 'info');
  } catch(err) { adminToast('Failed to delete message', 'error'); }
}

function updateMsgBadge(count) {
  const unread = count !== undefined ? count : _messages.filter(m => !m.read).length;
  document.querySelectorAll('.msg-badge').forEach(el => {
    el.textContent = unread;
    el.style.display = unread ? 'inline' : 'none';
  });
}

/* ── SETTINGS PAGE ────────────────────────────────── */
async function renderSettingsPage() {
  try {
    const s = await API.getAdminSettings();
    setVal('settings-hero-title',    s.heroTitle || '');
    setVal('settings-hero-subtitle', s.heroSubtitle || '');
    setVal('settings-stat-projects', s.statProjects || '');
    setVal('settings-stat-clients',  s.statClients || '');
    setVal('settings-stat-years',    s.statYears || '');
    setVal('settings-stat-sat',      s.statSatisfaction || '');
  } catch(err) { adminToast('Failed to load settings', 'error'); }
}

document.addEventListener('click', async e => {
  if (e.target.id === 'save-settings-btn') {
    try {
      await API.saveSettings({
        heroTitle:        val('settings-hero-title'),
        heroSubtitle:     val('settings-hero-subtitle'),
        statProjects:     val('settings-stat-projects'),
        statClients:      val('settings-stat-clients'),
        statYears:        val('settings-stat-years'),
        statSatisfaction: val('settings-stat-sat'),
      });
      adminToast('Settings saved!', 'success');
    } catch(err) { adminToast('Failed to save settings: ' + err.message, 'error'); }
  }

  if (e.target.id === 'change-pass-btn') {
    const errEl   = document.getElementById('pass-change-error');
    const showErr = msg => { if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } };
    const clearErr = () => { if (errEl) errEl.style.display = 'none'; };
    const cur = val('current-password');
    const np  = val('new-password');
    const cp  = val('confirm-password');
    clearErr();
    if (!cur) { showErr('Please enter your current password.'); return; }
    if (!np)  { showErr('New password cannot be empty.'); return; }
    if (np.length < 6) { showErr('New password must be at least 6 characters.'); return; }
    if (np !== cp) { showErr('New passwords do not match.'); return; }
    try {
      const s = await API.getAdminSettings();
      if (cur !== s.adminPassword) { showErr('Current password is incorrect.'); document.getElementById('current-password').value = ''; return; }
      await API.saveSettings({ adminPassword: np });
      ['current-password','new-password','confirm-password'].forEach(id => { document.getElementById(id).value = ''; });
      clearErr();
      adminToast('Password changed successfully!', 'success');
    } catch(err) { adminToast('Failed to change password', 'error'); }
  }

  if (e.target.id === 'clear-messages-btn') {
    if (confirm('Clear all messages? This cannot be undone.')) {
      try {
        await API.clearMessages();
        await renderMessagesPage();
        adminToast('All messages cleared', 'info');
      } catch(err) { adminToast('Failed to clear messages', 'error'); }
    }
  }

  if (e.target.id === 'sync-ls-btn') {
    await runLocalStorageSync();
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
document.addEventListener('click', async e => {
  if (e.target.id === 'confirm-delete-btn') {
    if (!_pendingDelete) return;
    const { type, id } = _pendingDelete;
    try {
      if (type === 'service') await API.deleteService(id);
      if (type === 'project') await API.deleteProject(id);
      if (type === 'review')  await API.deleteReview(id);
      if (type === 'video')   await API.deleteVideo(id);
      closeModal('confirm-modal');
      adminToast(`${capitalize(type)} deleted`, 'info');
      _pendingDelete = null;
      if (type === 'service') await renderServicesPage();
      if (type === 'project') await renderProjectsPage();
      if (type === 'review')  await renderReviewsPage();
      if (type === 'video')   await renderVideosPage();
      renderDashboard();
    } catch(err) { adminToast('Delete failed: ' + err.message, 'error'); }
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

/* \u2500\u2500 VIDEOS PAGE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
let _videos = [];
async function renderVideosPage() {
  const tbody = document.getElementById('videos-tbody');
  if (!tbody) return;
  try {
    _videos = await API.getVideos();
    if (!_videos.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--text-muted)">No videos yet. Click <strong>Add Video</strong> to get started.</td></tr>`;
      return;
    }
    tbody.innerHTML = _videos.map(v => {
      const ytId = API.extractYouTubeId(v.url);
      const thumb = ytId ? `<img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:60px;height:38px;object-fit:cover;border-radius:6px;border:1px solid var(--border)">` : '<span style="color:var(--text-muted);font-size:0.75rem">No thumb</span>';
      return `
        <tr>
          <td>${thumb}</td>
          <td><strong>${esc(v.title || '—')}</strong></td>
          <td><span style="color:var(--text-muted);font-size:0.8rem">${esc(v.label || '—')}</span></td>
          <td><a href="${esc(v.url)}" target="_blank" style="color:var(--orange);font-size:0.8rem;word-break:break-all">${esc(v.url ? v.url.substring(0, 40) + (v.url.length > 40 ? '…' : '') : '—')}</a></td>
          <td>
            <button class="btn btn-ghost btn-sm edit-video-btn" data-id="${v.id}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm delete-video-btn" data-id="${v.id}"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  } catch(err) { adminToast('Failed to load videos', 'error'); }
}

function openAddVideo() {
  document.getElementById('video-modal-title').textContent = 'Add Video';
  document.getElementById('video-id').value = '';
  document.getElementById('video-url-inp').value = '';
  document.getElementById('video-title-inp').value = '';
  document.getElementById('video-label-inp').value = '';
  document.getElementById('video-thumb-preview-wrap').style.display = 'none';
  openModal('video-modal');
}

function openEditVideo(id) {
  const v = _videos.find(x => x.id === id);
  if (!v) return;
  document.getElementById('video-modal-title').textContent = 'Edit Video';
  document.getElementById('video-id').value = v.id;
  document.getElementById('video-url-inp').value = v.url || '';
  document.getElementById('video-title-inp').value = v.title || '';
  document.getElementById('video-label-inp').value = v.label || '';
  const ytId = API.extractYouTubeId(v.url);
  if (ytId) {
    document.getElementById('video-thumb-preview').src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    document.getElementById('video-thumb-preview-wrap').style.display = 'block';
  } else {
    document.getElementById('video-thumb-preview-wrap').style.display = 'none';
  }
  openModal('video-modal');
}

async function saveVideoForm() {
  const url   = val('video-url-inp');
  const title = val('video-title-inp');
  if (!url)   { adminToast('YouTube URL is required', 'error'); return; }
  if (!title) { adminToast('Video title is required', 'error'); return; }
  const ytId = API.extractYouTubeId(url);
  if (!ytId)  { adminToast('Invalid YouTube URL — use a Shorts, watch or youtu.be link', 'error'); return; }
  try {
    await API.saveVideo({ id: val('video-id') || undefined, url, title, label: val('video-label-inp') });
    closeModal('video-modal');
    await renderVideosPage();
    adminToast('Video saved!', 'success');
  } catch(err) { adminToast('Failed to save video: ' + err.message, 'error'); }
}

/* Live thumbnail preview in modal */
document.addEventListener('input', e => {
  if (e.target.id !== 'video-url-inp') return;
  const ytId = API.extractYouTubeId(e.target.value);
  const wrap  = document.getElementById('video-thumb-preview-wrap');
  const img   = document.getElementById('video-thumb-preview');
  if (ytId) {
    img.src = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
});

/* Delegate clicks for video page buttons */
document.addEventListener('click', e => {
  if (e.target.id === 'add-video-btn' || e.target.closest('#add-video-btn')) openAddVideo();
  if (e.target.id === 'save-video-btn' || e.target.closest('#save-video-btn')) saveVideoForm();

  const editBtn = e.target.closest('.edit-video-btn');
  if (editBtn) openEditVideo(editBtn.dataset.id);

  const delBtn = e.target.closest('.delete-video-btn');
  if (delBtn) confirmDelete('video', delBtn.dataset.id);
});

/* \u2500\u2500 SHOWCASE PAGE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
let _scActiveType = 'services';

async function renderShowcasePage() {
  await Promise.all([
    renderShowcasePanel('services'),
    renderShowcasePanel('projects'),
    renderShowcasePanel('videos'),
  ]);
  document.querySelectorAll('.showcase-tab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.showcase-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.showcase-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      _scActiveType = btn.dataset.sc;
      document.getElementById(`sc-panel-${_scActiveType}`)?.classList.add('active');
    };
  });
}

async function renderShowcasePanel(type) {
  const listEl = document.getElementById(`sc-list-${type}`);
  if (!listEl) return;
  const limit = type === 'videos' ? 5 : 6;
  try {
    const allItems = await (type === 'services' ? API.getServices() : type === 'projects' ? API.getProjects() : API.getVideos());
    const showcase = await API.getShowcase(type);
    const showcaseIds = showcase.map(x => (typeof x === 'object' ? x.id : x)).filter(Boolean);
    const showcaseSet = new Set(showcaseIds);
    const showcasedItems = showcaseIds.map(id => allItems.find(x => x.id === id)).filter(Boolean);
    const restItems = allItems.filter(x => !showcaseSet.has(x.id));
    const orderedAll = [...showcasedItems, ...restItems];

    listEl.innerHTML = orderedAll.map(item => {
      const checked  = showcaseSet.has(item.id);
      const label    = type === 'videos' ? (item.title || item.url || 'Video') : item.title;
      const sublabel = type === 'services' ? '' : type === 'projects' ? (item.category || '') : (item.label || '');
      const ytId     = type === 'videos' ? API.extractYouTubeId(item.url) : null;
      const thumb    = ytId ? `<img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" class="sc-thumb">` : '';
      return `
        <div class="sc-item${checked ? ' sc-checked' : ''}" data-id="${item.id}" draggable="true">
          <span class="sc-drag-handle"><i class="fas fa-grip-vertical"></i></span>
          <label class="sc-checkbox-wrap">
            <input type="checkbox" class="sc-checkbox" data-id="${item.id}" ${checked ? 'checked' : ''}>
          </label>
          ${thumb}
          <div class="sc-item-info">
            <div class="sc-item-title">${esc(label)}</div>
            ${sublabel ? `<div class="sc-item-sub">${esc(sublabel)}</div>` : ''}
          </div>
          <span class="sc-badge">${checked ? `#${showcaseIds.indexOf(item.id) + 1}` : ''}</span>
        </div>
      `;
    }).join('');
    updateScCount(type);
    initScCheckboxes(listEl, type, limit);
    initDragReorder(listEl);
  } catch(err) { console.error('renderShowcasePanel:', err); adminToast('Failed to load showcase', 'error'); }
}

function initScCheckboxes(listEl, type, limit) {
  listEl.querySelectorAll('.sc-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = listEl.querySelectorAll('.sc-checkbox:checked');
      if (cb.checked && checked.length > limit) {
        cb.checked = false;
        adminToast(`Max ${limit} items allowed in showcase`, 'error');
        return;
      }
      cb.closest('.sc-item').classList.toggle('sc-checked', cb.checked);
      updateScCount(type);
      refreshScBadges(listEl);
    });
  });
}

function initDragReorder(listEl) {
  let dragged = null;
  listEl.querySelectorAll('.sc-item').forEach(item => {
    item.addEventListener('dragstart', () => { dragged = item; item.classList.add('sc-dragging'); });
    item.addEventListener('dragend',   () => { item.classList.remove('sc-dragging'); dragged = null; });
    item.addEventListener('dragover',  e => { e.preventDefault(); if (dragged && dragged !== item) {
      const rect = item.getBoundingClientRect();
      item.parentNode.insertBefore(dragged, e.clientY < rect.top + rect.height / 2 ? item : item.nextSibling);
    }});
  });
}

function refreshScBadges(listEl) {
  const checkedItems = [...listEl.querySelectorAll('.sc-item.sc-checked')];
  listEl.querySelectorAll('.sc-item').forEach(item => {
    const badge = item.querySelector('.sc-badge');
    if (!badge) return;
    const idx = checkedItems.indexOf(item);
    badge.textContent = idx !== -1 ? `#${idx + 1}` : '';
  });
}

function updateScCount(type) {
  const listEl = document.getElementById(`sc-list-${type}`);
  const limit  = type === 'videos' ? 5 : 6;
  if (!listEl) return;
  const count = listEl.querySelectorAll('.sc-checkbox:checked').length;
  const el    = document.getElementById(`sc-count-${type}`);
  if (el) el.textContent = `${count}/${limit}`;
}

async function saveShowcaseOrder(type) {
  const listEl = document.getElementById(`sc-list-${type}`);
  if (!listEl) return;
  const orderedIds = [...listEl.querySelectorAll('.sc-item')]
    .filter(el => el.querySelector('.sc-checkbox')?.checked)
    .map(el => el.dataset.id);
  try {
    await API.saveShowcase(type, orderedIds);
    await renderShowcasePanel(type);
    adminToast(`${capitalize(type)} showcase saved!`, 'success');
  } catch(err) { adminToast('Failed to save showcase: ' + err.message, 'error'); }
}

async function resetShowcase(type) {
  try {
    await API.resetShowcase(type);
    await renderShowcasePanel(type);
    adminToast(`${capitalize(type)} showcase reset to default`, 'info');
  } catch(err) { adminToast('Failed to reset showcase', 'error'); }
}

/* ── LOCALSTORAGE → DATABASE SYNC ─────────────────── */
async function runLocalStorageSync() {
  const btn = document.getElementById('sync-ls-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Syncing…'; }
  try {
    const results = await API.syncFromLocalStorage();
    const parts = Object.entries(results)
      .map(([k, v]) => `${capitalize(k)}: +${v.inserted||0} new, ${v.updated||0} updated`);
    adminToast('Sync complete!', 'success');
    if (parts.length) alert('Sync Complete!\n\n' + parts.join('\n'));
    await renderDashboard();
  } catch(err) {
    adminToast('Sync failed: ' + err.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Sync localStorage → Database'; }
  }
}
