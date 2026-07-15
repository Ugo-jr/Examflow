import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiFileText, FiAward, FiClock, FiTrendingUp, FiChevronRight, FiPlay } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { examService, resultService } from '../../services'
import StatCard from '../../components/shared/StatCard'

export default function StudentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      examService.list({ status: 'published' }),
      resultService.list(),
    ]).then(([examRes, resultRes]) => {
      setExams((examRes.data.results || examRes.data).slice(0, 5))
      setResults((resultRes.data.results || resultRes.data).slice(0, 5))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const avgScore = results.length > 0
    ? (results.reduce((s, r) => s + parseFloat(r.percentage), 0) / results.length).toFixed(1)
    : 0
  const passCount = results.filter(r => r.passed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.first_name} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiFileText} label="Available Exams" value={exams.length} color="indigo" delay={0} />
        <StatCard icon={FiAward} label="Exams Taken" value={results.length} color="blue" delay={0.05} />
        <StatCard icon={FiTrendingUp} label="Avg. Score" value={`${avgScore}%`} color="green" delay={0.1} />
        <StatCard icon={FiAward} label="Passed" value={passCount} color="purple" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Exams */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Available Exams</h2>
            <button onClick={() => navigate('/student/exams')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <FiChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiFileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No exams available right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exams.map((exam, i) => (
                <motion.div key={exam.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="text-indigo-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{exam.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{exam.course_title} • {exam.duration_minutes} min</p>
                  </div>
                  <button
                    onClick={() => navigate(`/exam/${exam.id}/take`)}
                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiPlay size={11} /> Start
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Results</h2>
            <button onClick={() => navigate('/student/results')} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <FiChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiAward size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No results yet. Take an exam!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, i) => (
                <motion.div key={result.id}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${result.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <FiAward className={result.passed ? 'text-green-600' : 'text-red-500'} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{result.exam_title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{result.course_title}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                      {parseFloat(result.percentage).toFixed(1)}%
                    </p>
                    <span className={`text-xs ${result.passed ? 'badge-green' : 'badge-red'}`}>
                      {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
