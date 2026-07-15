import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBookOpen } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Take exams and track results', color: 'indigo' },
  { value: 'instructor', label: 'Instructor', desc: 'Create and manage exams', color: 'blue' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password_confirm: '', role: 'student' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
    } catch (err) {
      const errs = err.response?.data
      if (errs) {
        Object.values(errs).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FiBookOpen className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">ExamFlow</span>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join ExamFlow today</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === r.value
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <p className={`font-semibold text-sm ${form.role === r.value ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>{r.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input type="text" value={form.first_name} onChange={set('first_name')}
                    className="input-field pl-9 py-2.5" placeholder="John" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input type="text" value={form.last_name} onChange={set('last_name')}
                    className="input-field pl-9 py-2.5" placeholder="Doe" required />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type="email" value={form.email} onChange={set('email')}
                  className="input-field pl-10 py-2.5" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className="input-field pl-10 pr-10 py-2.5" placeholder="Min. 8 characters" required minLength={8} />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type="password" value={form.password_confirm} onChange={set('password_confirm')}
                  className="input-field pl-10 py-2.5" placeholder="Repeat password" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
