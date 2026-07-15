import api from './api'

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.put('/auth/change-password/', data),
}

// ─── Users ──────────────────────────────────────────────────────────────────
export const userService = {
  list: (params) => api.get('/users/', { params }),
  get: (id) => api.get(`/users/${id}/`),
  update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`),
  toggleActive: (id) => api.post(`/users/${id}/toggle_active/`),
  stats: () => api.get('/users/stats/'),
  departments: () => api.get('/users/departments/'),
  createDepartment: (data) => api.post('/users/departments/', data),
}

// ─── Courses ────────────────────────────────────────────────────────────────
export const courseService = {
  list: (params) => api.get('/courses/', { params }),
  get: (id) => api.get(`/courses/${id}/`),
  create: (data) => api.post('/courses/', data),
  update: (id, data) => api.patch(`/courses/${id}/`, data),
  delete: (id) => api.delete(`/courses/${id}/`),
  enroll: (id) => api.post(`/courses/${id}/enroll/`),
  students: (id) => api.get(`/courses/${id}/students/`),
  myCourses: () => api.get('/courses/my_courses/'),
}

// ─── Exams ──────────────────────────────────────────────────────────────────
export const examService = {
  list: (params) => api.get('/exams/', { params }),
  get: (id) => api.get(`/exams/${id}/`),
  create: (data) => api.post('/exams/', data),
  update: (id, data) => api.patch(`/exams/${id}/`, data),
  delete: (id) => api.delete(`/exams/${id}/`),
  publish: (id) => api.post(`/exams/${id}/publish/`),
  close: (id) => api.post(`/exams/${id}/close/`),
  start: (id) => api.post(`/exams/${id}/start/`),
  saveAnswer: (id, data) => api.post(`/exams/${id}/save_answer/`, data),
  submit: (id, attemptId) => api.post(`/exams/${id}/submit/`, { attempt_id: attemptId }),
}

// ─── Questions ──────────────────────────────────────────────────────────────
export const questionService = {
  list: (examId) => api.get('/exams/questions/', { params: { exam: examId } }),
  create: (data) => api.post('/exams/questions/', data),
  update: (id, data) => api.patch(`/exams/questions/${id}/`, data),
  delete: (id) => api.delete(`/exams/questions/${id}/`),
}

// ─── Results ────────────────────────────────────────────────────────────────
export const resultService = {
  list: (params) => api.get('/results/', { params }),
  get: (id) => api.get(`/results/${id}/`),
  review: (id) => api.get(`/results/${id}/review/`),
  exportExcel: (examId) => api.get('/results/export_excel/', {
    params: { exam_id: examId }, responseType: 'blob'
  }),
  exportPdf: (examId) => api.get('/results/export_pdf/', {
    params: { exam_id: examId }, responseType: 'blob'
  }),
}

// ─── Notifications ──────────────────────────────────────────────────────────
export const notificationService = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  unreadCount: () => api.get('/notifications/unread_count/'),
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export const analyticsService = {
  admin: () => api.get('/analytics/admin/'),
  instructor: () => api.get('/analytics/instructor/'),
}
