import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiClock, FiPlay, FiFileText, FiCalendar } from 'react-icons/fi'
import { examService } from '../../services'
import { format } from 'date-fns'

export default function AvailableExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    examService.list({ status: 'published' }).then(r => {
      setExams(r.data.results || r.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.course_title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Exams</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exams.length} exams published</p>
        </div>
        <div className="sm:ml-auto relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm" placeholder="Search exams..." />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FiFileText size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">No exams found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((exam, i) => (
            <motion.div key={exam.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <FiFileText className="text-indigo-600" size={18} />
                </div>
                <span className="badge badge-blue">{exam.course_code}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{exam.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{exam.course_title}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><FiClock size={12} /> {exam.duration_minutes} min</span>
                <span className="flex items-center gap-1"><FiFileText size={12} /> {exam.question_count} questions</span>
              </div>

              {exam.end_datetime && (
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-4">
                  <FiCalendar size={11} />
                  Closes {format(new Date(exam.end_datetime), 'MMM d, h:mm a')}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Pass: {exam.passing_score}%</span>
                <button
                  onClick={() => navigate(`/exam/${exam.id}/take`)}
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                >
                  <FiPlay size={13} /> Start Exam
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
