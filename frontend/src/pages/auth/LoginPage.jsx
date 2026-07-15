import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiBookOpen } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (role) => {
    const demos = {
      student: { email: 'student@examflow.com', password: 'demo1234' },
      instructor: { email: 'instructor@examflow.com', password: 'demo1234' },
      admin: { email: 'admin@examflow.com', password: 'demo1234' },
    }
    setForm(demos[role])
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${80 + i*40}px`, height: `${80 + i*40}px`, top: `${10 + i*14}%`, left: `${5 + i*13}%`, opacity: 0.3 - i*0.04 }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <FiBookOpen className="text-white text-4xl" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">ExamFlow</h1>
          <p className="text-white/80 text-lg max-w-sm leading-relaxed">
            A modern examination platform for students, instructors, and administrators.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[['Students', '2.4k'], ['Exams', '840'], ['Pass Rate', '87%']].map(([label, val]) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-white/70 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FiBookOpen className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">ExamFlow</span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Sign in to your account</p>

            {/* Demo buttons */}
            <div className="flex gap-2 mb-6">
              {['student', 'instructor', 'admin'].map(role => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors capitalize"
                >
                  Demo {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              No account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
