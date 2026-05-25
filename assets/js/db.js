/**
 * Cyber Dreams - File-based Database (localStorage)
 * All data is stored in localStorage as JSON
 */

const DB = {
  KEYS: {
    SERVICES: 'cd_services',
    PROJECTS: 'cd_projects',
    REVIEWS: 'cd_reviews',
    TEAM: 'cd_team',
    SETTINGS: 'cd_settings',
    MESSAGES: 'cd_messages',
    STATS: 'cd_stats',
  },

  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  _getObj(key, defaults = {}) {
    try {
      return JSON.parse(localStorage.getItem(key)) || defaults;
    } catch {
      return defaults;
    }
  },

  _setObj(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /* ── SERVICES ─────────────────────────────────────── */
  getServices() { return this._get(this.KEYS.SERVICES); },
  saveService(service) {
    const list = this.getServices();
    if (service.id) {
      const i = list.findIndex(s => s.id === service.id);
      if (i !== -1) { list[i] = service; } else { list.push(service); }
    } else {
      service.id = this.generateId();
      service.createdAt = new Date().toISOString();
      list.push(service);
    }
    this._set(this.KEYS.SERVICES, list);
    return service;
  },
  deleteService(id) {
    this._set(this.KEYS.SERVICES, this.getServices().filter(s => s.id !== id));
  },

  /* ── PROJECTS ─────────────────────────────────────── */
  getProjects() { return this._get(this.KEYS.PROJECTS); },
  saveProject(project) {
    const list = this.getProjects();
    if (project.id) {
      const i = list.findIndex(p => p.id === project.id);
      if (i !== -1) { list[i] = project; } else { list.push(project); }
    } else {
      project.id = this.generateId();
      project.createdAt = new Date().toISOString();
      list.push(project);
    }
    this._set(this.KEYS.PROJECTS, list);
    return project;
  },
  deleteProject(id) {
    this._set(this.KEYS.PROJECTS, this.getProjects().filter(p => p.id !== id));
  },

  /* ── REVIEWS ──────────────────────────────────────── */
  getReviews() { return this._get(this.KEYS.REVIEWS); },
  saveReview(review) {
    const list = this.getReviews();
    if (review.id) {
      const i = list.findIndex(r => r.id === review.id);
      if (i !== -1) { list[i] = review; } else { list.push(review); }
    } else {
      review.id = this.generateId();
      review.createdAt = new Date().toISOString();
      list.push(review);
    }
    this._set(this.KEYS.REVIEWS, list);
    return review;
  },
  deleteReview(id) {
    this._set(this.KEYS.REVIEWS, this.getReviews().filter(r => r.id !== id));
  },

  /* ── MESSAGES ─────────────────────────────────────── */
  getMessages() { return this._get(this.KEYS.MESSAGES); },
  saveMessage(msg) {
    const list = this.getMessages();
    msg.id = this.generateId();
    msg.createdAt = new Date().toISOString();
    msg.read = false;
    list.unshift(msg);
    this._set(this.KEYS.MESSAGES, list);
    return msg;
  },
  markMessageRead(id) {
    const list = this.getMessages();
    const i = list.findIndex(m => m.id === id);
    if (i !== -1) { list[i].read = true; this._set(this.KEYS.MESSAGES, list); }
  },
  deleteMessage(id) {
    this._set(this.KEYS.MESSAGES, this.getMessages().filter(m => m.id !== id));
  },

  /* ── SETTINGS ─────────────────────────────────────── */
  getSettings() {
    return this._getObj(this.KEYS.SETTINGS, {
      heroTitle: 'Transforming Ideas Into Digital Reality',
      heroSubtitle: 'We build enterprise software, networking solutions, CCTV systems, and IT infrastructure that powers businesses worldwide.',
      adminPassword: 'cyberdreams2024',
    });
  },
  saveSettings(settings) { this._setObj(this.KEYS.SETTINGS, settings); },

  /* ── STATS ────────────────────────────────────────── */
  getStats() {
    return this._getObj(this.KEYS.STATS, {
      projects: '500+',
      clients: '200+',
      years: '10+',
      satisfaction: '100%',
    });
  },
  saveStats(stats) { this._setObj(this.KEYS.STATS, stats); },

  /* ── SEED DEFAULT DATA ────────────────────────────── */
  seed() {
    if (this.getServices().length === 0) {
      const defaultServices = [
        { title: 'Software Development', icon: 'fas fa-code', description: 'Enterprise-grade software solutions tailored for your business needs. From web apps to complex ERP systems.', image: '', featured: true },
        { title: 'Networking Solutions', icon: 'fas fa-network-wired', description: 'Robust and secure network infrastructure design, deployment, and management for businesses of all sizes.', image: '', featured: true },
        { title: 'CCTV Systems', icon: 'fas fa-video', description: 'Advanced surveillance systems with HD cameras, remote monitoring, and intelligent analytics for security.', image: '', featured: true },
        { title: 'IT Infrastructure', icon: 'fas fa-server', description: 'Complete IT setup, maintenance and support including servers, cloud migration, and hardware.', image: '', featured: true },
        { title: 'Web Design & Development', icon: 'fas fa-globe', description: 'Stunning, responsive websites and web applications built with the latest technologies.', image: '', featured: false },
        { title: 'Cybersecurity', icon: 'fas fa-shield-alt', description: 'Protect your business with penetration testing, vulnerability assessments and security audits.', image: '', featured: false },
      ];
      defaultServices.forEach(s => this.saveService(s));
    }

    if (this.getProjects().length === 0) {
      const defaultProjects = [
        { title: 'Enterprise ERP System', category: 'Software', description: 'Full-scale ERP for a manufacturing company with 500+ users.', image: '', client: 'ABC Manufacturing', year: '2024', featured: true },
        { title: 'Smart Office Network', category: 'Networking', description: 'Complete network overhaul for a corporate headquarters.', image: '', client: 'XYZ Corp', year: '2024', featured: true },
        { title: 'Bank Security System', category: 'CCTV', description: '120-camera CCTV installation across 5 bank branches.', image: '', client: 'National Bank', year: '2023', featured: true },
        { title: 'E-Commerce Platform', category: 'Web', description: 'Scalable e-commerce solution with 10,000+ daily users.', image: '', client: 'ShopEasy', year: '2023', featured: false },
      ];
      defaultProjects.forEach(p => this.saveProject(p));
    }

    if (this.getReviews().length === 0) {
      const defaultReviews = [
        { name: 'Ahmed Hassan', company: 'TechCorp Pakistan', rating: 5, review: 'Cyber Dreams delivered an exceptional ERP system on time and within budget. Their team was professional and responsive throughout the project.', avatar: '', featured: true },
        { name: 'Sara Khan', company: 'Retail Solutions Ltd', rating: 5, review: 'Outstanding web development work. The platform they built handles thousands of transactions daily without any issues.', avatar: '', featured: true },
        { name: 'Bilal Ahmed', company: 'SecureBank', rating: 5, review: 'The CCTV and networking solution provided by Cyber Dreams is top-notch. Excellent after-sale support.', avatar: '', featured: true },
      ];
      defaultReviews.forEach(r => this.saveReview(r));
    }
  },
};

DB.seed();
