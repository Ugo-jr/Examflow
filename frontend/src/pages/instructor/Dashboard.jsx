import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiBook, FiFileText, FiTrendingUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { analyticsService } from '../../services'
import StatCard from '../../components/shared/StatCard'

const COLORS = ['#4F46E5', '#EF4444']

export default function InstructorDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsService.instructor().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
  }

  const pieData = [
    { name: 'Passed', value: Math.round(stats.pass_rate) },
    { name: 'Failed', value: Math.round(100 - stats.pass_rate) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of your courses and exam performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Students" value={stats.total_students} color="indigo" delay={0} />
        <StatCard icon={FiBook} label="Courses" value={stats.total_courses} color="blue" delay={0.05} />
        <StatCard icon={FiFileText} label="Exams Created" value={stats.total_exams} color="purple" delay={0.1} />
        <StatCard icon={FiTrendingUp} label="Avg. Score" value={`${stats.avg_score.toFixed(1)}%`} color="green" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Exam Performance</h2>
          {stats.exam_stats.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No exam data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.exam_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="exam" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Overall Pass Rate</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={4}>
                {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Passed</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Failed</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Results</h2>
        <div className="space-y-2">
          {stats.recent_results.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No results yet</p>
          ) : stats.recent_results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.student}</p>
                <p className="text-xs text-gray-500">{r.exam}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.score.toFixed(1)}%</span>
                <span className={r.passed ? 'badge-green' : 'badge-red'}>{r.passed ? 'Passed' : 'Failed'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
