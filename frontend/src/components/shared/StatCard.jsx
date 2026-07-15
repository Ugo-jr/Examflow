import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'indigo', trend, delay = 0 }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 text-red-600',
  }
  const [gradient, bg, textColor] = colors[color]?.split(' ') || colors.indigo.split(' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="stat-card"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={textColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
          </p>
        )}
      </div>
    </motion.div>
  )
}
