/**
 * App.jsx — Root router with role-based protected routes
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Shared layout
import DashboardLayout from './components/layout/DashboardLayout'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import AvailableExams from './pages/student/AvailableExams'
import MyResults from './pages/student/MyResults'
import StudentProfile from './pages/student/Profile'

// Instructor pages
import InstructorDashboard from './pages/instructor/Dashboard'
import ManageExams from './pages/instructor/ManageExams'
import CreateExam from './pages/instructor/CreateExam'
import ExamQuestions from './pages/instructor/ExamQuestions'
import ManageCourses from './pages/instructor/ManageCourses'
import ViewResults from './pages/instructor/ViewResults'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageUsers from './pages/admin/ManageUsers'
import AdminCourses from './pages/admin/Courses'
import AdminExams from './pages/admin/Exams'
import Departments from './pages/admin/Departments'
import SystemSettings from './pages/admin/SystemSettings'

// Exam interface
import ExamInterface from './pages/exam/ExamInterface'
import ResultPage from './pages/exam/ResultPage'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading ExamFlow...</p>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Exam interface (standalone, no sidebar) */}
      <Route path="/exam/:examId/take" element={
        <ProtectedRoute roles={['student']}>
          <ExamInterface />
        </ProtectedRoute>
      } />
      <Route path="/exam/result/:resultId" element={
        <ProtectedRoute roles={['student']}>
          <ResultPage />
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute roles={['student']}>
          <DashboardLayout role="student" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="exams" element={<AvailableExams />} />
        <Route path="results" element={<MyResults />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Instructor routes */}
      <Route path="/instructor" element={
        <ProtectedRoute roles={['instructor']}>
          <DashboardLayout role="instructor" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="exams" element={<ManageExams />} />
        <Route path="exams/create" element={<CreateExam />} />
        <Route path="exams/:examId/questions" element={<ExamQuestions />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="results" element={<ViewResults />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout role="admin" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="exams" element={<AdminExams />} />
        <Route path="departments" element={<Departments />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
