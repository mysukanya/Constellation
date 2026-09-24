const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? '/api'
      : 'http://127.0.0.1:8000/api');

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('constellation_token');
  }

  setToken(token) {
    localStorage.setItem('constellation_token', token);
  }

  clearToken() {
    localStorage.removeItem('constellation_token');
    localStorage.removeItem('constellation_user');
  }

  headers(isJson = true) {
    const h = {};
    if (isJson) h['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async request(method, path, body = null, isFormData = false) {
    const opts = { method, headers: isFormData ? {} : this.headers() };
    if (isFormData) {
      const token = this.getToken();
      if (token) opts.headers = { 'Authorization': `Bearer ${token}` };
    }
    if (body) {
      opts.body = isFormData ? body : JSON.stringify(body);
    }

    const res = await fetch(`${this.baseUrl}${path}`, opts);

    if (res.ok) {
      return await res.json();
    }

    // Handle specific error codes
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.detail || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.detail = errorData.detail;
    throw error;
  }

  // ---- Auth ----
  async login(username, password) {
    const data = await this.request('POST', '/auth/login', { username, password });
    if (data?.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(username, password, full_name = '', role = 'investigator') {
    const data = await this.request('POST', '/auth/register', { username, password, full_name, role });
    if (data?.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return this.request('GET', '/auth/me');
  }

  async listUsers() {
    return this.request('GET', '/auth/users');
  }

  async createUser(userData) {
    return this.request('POST', '/auth/users', userData);
  }

  logout() {
    this.clearToken();
  }

  // ---- Home ----
  getBriefing() {
    return this.request('GET', '/home/briefing');
  }

  // ---- Cases ----
  listCases() {
    return this.request('GET', '/cases');
  }
  getCase(caseId) {
    return this.request('GET', `/cases/${caseId}`);
  }
  createCase(data) {
    return this.request('POST', '/cases', data);
  }
  getCaseSubgraph(caseId) {
    return this.request('GET', `/cases/${caseId}/subgraph`);
  }

  // ---- Entities ----
  listEntities(label = 'Person', caseId = null) {
    let url = `/entities?label=${label}`;
    if (caseId) url += `&case_id=${caseId}`;
    return this.request('GET', url);
  }
  getEntity(entityId) {
    return this.request('GET', `/entities/${entityId}`);
  }
  createEntity(data) {
    return this.request('POST', '/entities', data);
  }

  // ---- Relationships ----
  createRelationship(data) {
    return this.request('POST', '/relationships', data);
  }

  // ---- Ingestion ----
  uploadPdf(caseId, file, autoCommit = true) {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    form.append('auto_commit', autoCommit);
    return this.request('POST', '/ingestion/upload-pdf', form, true);
  }
  uploadCsv(caseId, file) {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    return this.request('POST', '/ingestion/upload-csv', form, true);
  }
  uploadMedia(caseId, file, mediaType = 'photo') {
    const form = new FormData();
    form.append('file', file);
    form.append('case_id', caseId);
    form.append('media_type', mediaType);
    return this.request('POST', '/ingestion/upload-media', form, true);
  }

  // ---- Entity Resolution ----
  getPendingMatches(caseId = null) {
    let url = '/entity-resolution/matches';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  resolveMatch(matchId, action, notes = '') {
    return this.request('POST', `/entity-resolution/matches/${matchId}/resolve`, { action, notes });
  }
  triggerErSweep(caseId = null) {
    let url = '/entity-resolution/trigger';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('POST', url);
  }

  // ---- Evidence ----
  listEvidence(caseId = null) {
    let url = '/evidence';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  getEvidence(evidenceId) {
    return this.request('GET', `/evidence/${evidenceId}`);
  }

  // ---- Byomkesh ----
  queryByomkesh(question, caseId = null, focusEntityIds = []) {
    return this.request('POST', '/byomkesh/query', {
      question,
      case_id: caseId,
      focus_entity_ids: focusEntityIds
    });
  }

  // ---- Hypotheses ----
  listHypotheses(caseId = null) {
    let url = '/hypotheses';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  createHypothesis(data) {
    return this.request('POST', '/hypotheses', data);
  }
  challengeHypothesis(hypothesisId, challengeStatement, additionalEvidenceIds = []) {
    return this.request('POST', `/hypotheses/${hypothesisId}/challenge`, {
      challenge_statement: challengeStatement,
      additional_evidence_ids: additionalEvidenceIds
    });
  }
  runAutoResearch(data) {
    return this.request('POST', '/hypotheses/auto-research', data);
  }
  getResearchRuns(caseId = null) {
    let url = '/hypotheses/auto-research/runs';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }

  // ---- Audit ----
  verifyAuditLedger() {
    return this.request('GET', '/audit/verify');
  }
  getRecentAudit(limit = 50) {
    return this.request('GET', `/audit/recent?limit=${limit}`);
  }

  // ---- Sweep ----
  getLatestSweep() {
    return this.request('GET', '/sweep/latest');
  }
  triggerSweep() {
    return this.request('POST', '/sweep/trigger');
  }

  // ---- Home ----
  getHomeBriefing() {
    return this.request('GET', '/home/briefing');
  }

  // ---- Workspaces ----
  listWorkspaces(caseId = null) {
    let url = '/workspaces';
    if (caseId) url += `?case_id=${caseId}`;
    return this.request('GET', url);
  }
  getWorkspace(workspaceId) {
    return this.request('GET', `/workspaces/${workspaceId}`);
  }
  createWorkspace(data) {
    return this.request('POST', '/workspaces', data);
  }
  updateWorkspace(workspaceId, data) {
    return this.request('PUT', `/workspaces/${workspaceId}`, data);
  }
  deleteWorkspace(workspaceId) {
    return this.request('DELETE', `/workspaces/${workspaceId}`);
  }

  // ---- Notifications ----
  listNotifications(unreadOnly = false) {
    return this.request('GET', `/notifications?unread_only=${unreadOnly}`);
  }
  markNotificationRead(notificationId) {
    return this.request('POST', `/notifications/${notificationId}/read`);
  }
  markAllNotificationsRead() {
    return this.request('POST', '/notifications/read-all');
  }

  // ---- Health ----
  async healthCheck() {
    try {
      return await this.request('GET', '/health');
    } catch {
      return { status: 'unreachable' };
    }
  }
}

const api = new ApiService();
export default api;
