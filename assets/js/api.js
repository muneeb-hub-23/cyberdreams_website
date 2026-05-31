/**
 * Cyber Dreams – API Client
 * Drop-in async replacement for the old localStorage DB.
 * All methods return Promises. The frontend awaits them.
 */

const API_BASE = '/api';

const API = {
  /* ── Internal helpers ───────────────────────── */
  async _req(method, path, body) {
    const opts = {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },
  get(path)         { return this._req('GET',    path); },
  post(path, body)  { return this._req('POST',   path, body); },
  put(path, body)   { return this._req('PUT',    path, body); },
  patch(path, body) { return this._req('PATCH',  path, body); },
  del(path)         { return this._req('DELETE', path); },

  /* ── Auth ───────────────────────────────────── */
  login(password)   { return this.post('/auth/login',  { password }); },
  logout()          { return this.post('/auth/logout'); },
  getMe()           { return this.get('/auth/me'); },

  /* ── Services ───────────────────────────────── */
  getServices()              { return this.get('/services'); },
  saveService(s)             { return s.id ? this.put(`/services/${s.id}`, s) : this.post('/services', s); },
  deleteService(id)          { return this.del(`/services/${id}`); },
  syncServices(items)        { return this.post('/services/bulk-sync', items); },

  /* ── Projects ───────────────────────────────── */
  getProjects()              { return this.get('/projects'); },
  saveProject(p)             { return p.id ? this.put(`/projects/${p.id}`, p) : this.post('/projects', p); },
  deleteProject(id)          { return this.del(`/projects/${id}`); },
  syncProjects(items)        { return this.post('/projects/bulk-sync', items); },

  /* ── Reviews ────────────────────────────────── */
  getReviews()               { return this.get('/reviews'); },
  saveReview(r)              { return r.id ? this.put(`/reviews/${r.id}`, r) : this.post('/reviews', r); },
  deleteReview(id)           { return this.del(`/reviews/${id}`); },
  syncReviews(items)         { return this.post('/reviews/bulk-sync', items); },

  /* ── Videos ─────────────────────────────────── */
  getVideos()                { return this.get('/videos'); },
  saveVideo(v)               { return v.id ? this.put(`/videos/${v.id}`, v) : this.post('/videos', v); },
  deleteVideo(id)            { return this.del(`/videos/${id}`); },
  syncVideos(items)          { return this.post('/videos/bulk-sync', items); },

  /* ── Messages ───────────────────────────────── */
  getMessages()              { return this.get('/messages'); },
  sendMessage(msg)           { return this.post('/messages', msg); },
  markMessageRead(id)        { return this.patch(`/messages/${id}/read`); },
  deleteMessage(id)          { return this.del(`/messages/${id}`); },
  clearMessages()            { return this.del('/messages'); },

  /* ── Settings ───────────────────────────────── */
  getSettings()              { return this.get('/settings'); },
  getAdminSettings()         { return this.get('/settings/admin'); },
  saveSettings(obj)          { return this.put('/settings', obj); },
  syncSettings(s, stats)     { return this.post('/settings/bulk-sync', { settings: s, stats }); },

  /* ── Showcase ───────────────────────────────── */
  getShowcase(type)          { return this.get(`/showcase/${type}`); },
  saveShowcase(type, ids)    { return this.put(`/showcase/${type}`, { orderedIds: ids }); },
  resetShowcase(type)        { return this.del(`/showcase/${type}`); },
  syncShowcase(sc)           { return this.post('/showcase/bulk-sync', sc); },

  /* ── YouTube helper (client-side only) ──────── */
  extractYouTubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/shorts\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
    ];
    for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
    return null;
  },

  /* ── localStorage → DB Sync ─────────────────── */
  async syncFromLocalStorage() {
    const LS = key => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
    const LSO = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; } };

    const results = {};

    const services = LS('cd_services');
    if (services.length) results.services = await this.syncServices(services);

    const projects = LS('cd_projects');
    if (projects.length) results.projects = await this.syncProjects(projects);

    const reviews  = LS('cd_reviews');
    if (reviews.length)  results.reviews  = await this.syncReviews(reviews);

    const videos   = LS('cd_videos');
    if (videos.length)   results.videos   = await this.syncVideos(videos);

    const settings = LSO('cd_settings', null);
    const stats    = LSO('cd_stats', null);
    if (settings || stats) results.settings = await this.syncSettings(settings, stats);

    const scServices = LS('cd_showcase_services');
    const scProjects = LS('cd_showcase_projects');
    const scVideos   = LS('cd_showcase_videos');
    if (scServices.length || scProjects.length || scVideos.length) {
      results.showcase = await this.syncShowcase({
        services: scServices,
        projects: scProjects,
        videos:   scVideos,
      });
    }

    return results;
  },
};

window.API = API;
