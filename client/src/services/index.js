import api from './api.js';

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const hackathonService = {
  getAll: (params) => api.get('/hackathons', { params }),
  getFeatured: () => api.get('/hackathons/featured'),
  getOne: (id) => api.get(`/hackathons/${id}`),
  getMy: () => api.get('/hackathons/my/all'),
  create: (data) => api.post('/hackathons', data),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`),
  register: (id) => api.post(`/hackathons/${id}/register`),
  assignJudge: (id, judgeId) => api.post(`/hackathons/${id}/judges`, { judgeId }),
  getJudgesPool: () => api.get('/hackathons/judges/pool'),
  getTeams: (id) => api.get(`/hackathons/${id}/teams`),
  toggleBookmark: (id) => api.post(`/hackathons/${id}/bookmark`),
};


export const teamService = {
  create: (data) => api.post('/teams', data),
  join: (data) => api.post('/teams/join', data),
  getOne: (id) => api.get(`/teams/${id}`),
  getMy: (hackathonId) => api.get(`/teams/my/${hackathonId}`),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`),
  regenerateCode: (id) => api.post(`/teams/${id}/regenerate-code`),
  removeMember: (id, userId) => api.delete(`/teams/${id}/members/${userId}`),
  leave: (id) => api.post(`/teams/${id}/leave`),
  transferLeadership: (id, newLeaderId) => api.patch(`/teams/${id}/transfer`, { newLeaderId }),
};

export const submissionService = {
  create: (data) => api.post('/submissions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getOne: (id) => api.get(`/submissions/${id}`),
  getMy: (hackathonId) => api.get(`/submissions/my/${hackathonId}`),
  getForHackathon: (hackathonId) => api.get(`/submissions/hackathon/${hackathonId}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  assignJudges: (id, judgeIds) => api.post(`/submissions/${id}/assign-judges`, { judgeIds }),
};

export const reviewService = {
  submit: (data) => api.post('/reviews', data),
  getMyReview: (submissionId) => api.get(`/reviews/submission/${submissionId}`),
  getAllForSubmission: (submissionId) => api.get(`/reviews/submission/${submissionId}/all`),
  getLeaderboard: (hackathonId) => api.get(`/reviews/leaderboard/${hackathonId}`),
  getJudgeDashboard: () => api.get('/reviews/judge-dashboard'),
};

export const adminService = {
  getRequests: () => api.get('/admin/requests'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  approveUser: (id) => api.patch(`/admin/users/${id}/approve`),
  rejectUser: (id, reason) => api.patch(`/admin/users/${id}/reject`, { reason }),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  deleteHackathon: (id) => api.delete(`/admin/hackathons/${id}`),
};
