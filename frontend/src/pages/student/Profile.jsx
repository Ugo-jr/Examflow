import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiCamera } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', bio: user?.bio || '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authService.updateProfile(form)
      updateUser(data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSavingPw(true)
    try {
      await authService.changePassword(pwForm)
      toast.success('Password changed!')
      setPwForm({ old_password: '', new_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <FiCamera size={12} className="text-gray-600" />
          </button>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge badge-blue capitalize mt-1">{user?.role}</span>
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
              <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
              <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field pl-10" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Tell us about yourself..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <FiSave size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Password form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="password" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} className="input-field pl-10" minLength={8} required />
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="btn-secondary">
            {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
