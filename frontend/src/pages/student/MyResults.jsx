import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiAward, FiEye, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { resultService } from '../../services'
import { format } from 'date-fns'
import DataTable from '../../components/shared/DataTable'

export default function MyResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    resultService.list().then(r => {
      setResults(r.data.results || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length).toFixed(1)
    : 0
  const passCount = results.filter(r => r.passed).length

  const columns = [
    { key: 'exam_title', label: 'Exam', render: (v, row) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{v}</p>
        <p className="text-xs text-gray-500">{row.course_title}</p>
      </div>
    )},
    { key: 'percentage', label: 'Score', render: (v) => (
      <span className="font-semibold">{parseFloat(v).toFixed(1)}%</span>
    )},
    { key: 'passed', label: 'Status', render: (v) => (
      <span className={v ? 'badge-green' : 'badge-red'}>
        {v ? <><FiCheckCircle size={11} className="inline mr-1" />Passed</> : <><FiXCircle size={11} className="inline mr-1" />Failed</>}
      </span>
    )},
    { key: 'time_taken_formatted', label: 'Time Taken' },
    { key: 'created_at', label: 'Date', render: (v) => format(new Date(v), 'MMM d, yyyy') },
    { key: 'id', label: '', render: (v) => (
      <button onClick={() => navigate(`/exam/result/${v}`)} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium">
        <FiEye size={14} /> Review
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Review your exam performance history</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Exams', value: results.length, icon: FiAward, color: 'indigo' },
          { label: 'Average Score', value: `${avgScore}%`, icon: FiClock, color: 'blue' },
          { label: 'Passed', value: `${passCount}/${results.length}`, icon: FiCheckCircle, color: 'green' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <stat.icon className={`text-${stat.color}-600 mb-2`} size={20} />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card p-6">
        <DataTable columns={columns} data={results} loading={loading} />
      </div>
    </div>
  )
}
