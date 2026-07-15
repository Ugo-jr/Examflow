/**
 * DashboardLayout — Persistent sidebar + top navigation
 */
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome, FiBook, FiFileText, FiUsers, FiBarChart2, FiSettings,
  FiBell, FiSun, FiMoon, FiLogOut, FiMenu, FiX, FiAward,
  FiBookOpen, FiGrid, FiLayers, FiUser, FiChevronDown
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import NotificationPanel from '../dashboard/NotificationPanel'

const NAV_CONFIG = {
  student: [
    { to: '/student/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/student/exams', icon: FiFileText, label: 'Available Exams' },
    { to: '/student/results', icon: FiAward, label: 'My Results' },
    { to: '/student/profile', icon: FiUser, label: 'Profile' },
  ],
  instructor: [
    { to: '/instructor/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/instructor/courses', icon: FiBook, label: 'Courses' },
    { to: '/instructor/exams', icon: FiFileText, label: 'Exams' },
    { to: '/instructor/results', icon: FiBarChart2, label: 'Results' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/courses', icon: FiBook, label: 'Courses' },
    { to: '/admin/exams', icon: FiFileText, label: 'Exams' },
    { to: '/admin/departments', icon: FiLayers, label: 'Departments' },
    { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ],
}

const ROLE_COLORS = {
  student: 'from-indigo-600 to-purple-600',
  instructor: 'from-blue-600 to-cyan-600',
  admin: 'from-orange-500 to-red-500',
}

const ROLE_LABELS = {
  student: 'Student Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Console',
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navItems = NAV_CONFIG[role] || []

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`px-6 py-5 bg-gradient-to-r ${ROLE_COLORS[role]} flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <FiBookOpen className="text-white text-xl" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">ExamFlow</p>
            <p className="text-white/70 text-xs mt-0.5">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-white/80 hover:text-white p-1">
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ROLE_COLORS[role]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <button
          onClick={logout}
          className="nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          >
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors relative"
            >
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 z-50"
                >
                  <NotificationPanel onClose={() => setNotifOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ROLE_COLORS[role]} flex items-center justify-center text-white font-bold text-xs`}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.first_name}
              </span>
              <FiChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-48 card py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
