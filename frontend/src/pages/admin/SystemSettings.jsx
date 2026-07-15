import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSettings, FiSave, FiShield, FiMail, FiDatabase } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    site_name: 'ExamFlow',
    allow_registration: true,
    require_email_verification: false,
    max_login_attempts: 5,
    session_timeout: 60,
    enable_notifications: true,
  })

  const handleSave = (e) => {
    e.preventDefault()
    toast.success('Settings saved successfully')
  }

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setSettings(s => ({ ...s, [field]: val }))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure platform-wide options</p>
      </div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave} className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiSettings className="text-indigo-600" size={18} />
            <h2 className="font-semibold text-gray-900 dark:text-white">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Site Name</label>
              <input value={settings.site_name} onChange={set('site_name')} className="input-field" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.allow_registration} onChange={set('allow_registration')} className="w-4 h-4 rounded text-indigo-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Allow new user registration</span>
            </label>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-indigo-600" size={18} />
            <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.require_email_verification} onChange={set('require_email_verification')} className="w-4 h-4 rounded text-indigo-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Require email verification</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Login Attempts</label>
                <input type="number" value={settings.max_login_attempts} onChange={set('max_login_attempts')} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Session Timeout (min)</label>
                <input type="number" value={settings.session_timeout} onChange={set('session_timeout')} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiMail className="text-indigo-600" size={18} />
            <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={settings.enable_notifications} onChange={set('enable_notifications')} className="w-4 h-4 rounded text-indigo-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable system notifications</span>
          </label>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2">
          <FiSave size={16} /> Save Settings
        </button>
      </motion.form>
    </div>
  )
}
