/**
 * AuthContext — JWT token management and user state
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin/dashboard'
    if (role === 'instructor') return '/instructor/dashboard'
    return '/student/dashboard'
  }

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login/', { email, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    toast.success(`Welcome back, ${data.user.first_name}!`)
    navigate(getDashboardPath(data.user.role))
    return data.user
  }, [navigate])

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/auth/register/', formData)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    toast.success('Account created! Welcome to ExamFlow.')
    navigate(getDashboardPath(data.user.role))
    return data.user
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/auth/logout/', { refresh })
    } catch (_) {}
    localStorage.clear()
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully.')
  }, [navigate])

  const updateUser = useCallback((updated) => {
    const merged = { ...user, ...updated }
    setUser(merged)
    localStorage.setItem('user', JSON.stringify(merged))
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
