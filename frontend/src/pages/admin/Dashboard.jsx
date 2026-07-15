import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiBook, FiFileText, FiAward, FiTrendingUp } from 'react-icons/fi'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { analyticsService } from '../../services'
import StatCard from '../../components/shared/StatCard'

const COLORS = ['#6366F1', '#3B82F6', '#F59E0B']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    analyticsService.admin().then(r => setStats(r.data))
  }, [])

  if (!stats) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
  }

  const userPie = [
    { name: 'Students', value: stats.users.students },
    { name: 'Instructors', value: stats.users.instructors },
    { name: 'Admins', value: stats.users.total - stats.users.students - stats.users.instructors },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Console</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">System-wide overview and analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Users" value={stats.users.total} color="indigo" delay={0} />
        <StatCard icon={FiBook} label="Active Courses" value={stats.courses} color="blue" delay={0.05} />
        <StatCard icon={FiFileText} label="Total Exams" value={stats.exams.total} color="purple" delay={0.1} />
        <StatCard icon={FiTrendingUp} label="Avg. Score" value={`${stats.results.avg_score.toFixed(1)}%`} color="green" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={userPie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {userPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Students', value: stats.users.students, icon: FiUsers, color: 'indigo' },
            { label: 'Instructors', value: stats.users.instructors, icon: FiUsers, color: 'blue' },
            { label: 'Published Exams', value: stats.exams.published, icon: FiFileText, color: 'green' },
            { label: 'Draft Exams', value: stats.exams.draft, icon: FiFileText, color: 'orange' },
            { label: 'Total Attempts', value: stats.results.total, icon: FiAward, color: 'purple' },
            { label: 'Passed', value: stats.results.passed, icon: FiTrendingUp, color: 'green' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
              <s.icon className={`text-${s.color}-600 mb-2`} size={18} />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
