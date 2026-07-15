import { useEffect, useState } from 'react'
import { FiBell, FiCheck, FiX } from 'react-icons/fi'
import { notificationService } from '../../services'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.list().then(r => {
      setNotifications(r.data.results || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await notificationService.markRead(id)
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: true } : notif))
  }

  const markAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications(n => n.map(notif => ({ ...notif, is_read: true })))
  }

  const typeColors = { exam: 'bg-indigo-500', result: 'bg-green-500', course: 'bg-blue-500', system: 'bg-gray-500' }

  return (
    <div className="card overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FiBell size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</span>
          <span className="badge badge-blue">{notifications.filter(n => !n.is_read).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            <FiCheck size={12} /> All read
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <FiX size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <FiBell size={24} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No notifications</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.notification_type] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
