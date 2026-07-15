import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPlus, FiFileText, FiEdit2, FiTrash2, FiSend, FiEye, FiClock, FiUsers } from 'react-icons/fi'
import { examService } from '../../services'
import toast from 'react-hot-toast'

const STATUS_BADGE = { draft: 'badge-yellow', published: 'badge-green', closed: 'badge-red' }

export default function ManageExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    examService.list().then(r => setExams(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handlePublish = async (id) => {
    try {
      await examService.publish(id)
      toast.success('Exam published!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam? This cannot be undone.')) return
    await examService.delete(id)
    toast.success('Exam deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Exams</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exams.length} exams total</p>
        </div>
        <button onClick={() => navigate('/instructor/exams/create')} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Create Exam
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : exams.length === 0 ? (
        <div className="card p-16 text-center">
          <FiFileText size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 mb-4">No exams created yet</p>
          <button onClick={() => navigate('/instructor/exams/create')} className="btn-primary">Create your first exam</button>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam, i) => (
            <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                <FiFileText className="text-indigo-600" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{exam.title}</p>
                  <span className={STATUS_BADGE[exam.status]}>{exam.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{exam.course_title}</span>
                  <span className="flex items-center gap-1"><FiClock size={11} /> {exam.duration_minutes} min</span>
                  <span className="flex items-center gap-1"><FiFileText size={11} /> {exam.question_count} questions</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => navigate(`/instructor/exams/${exam.id}/questions`)}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5">
                  <FiEdit2 size={12} /> Questions
                </button>
                {exam.status === 'draft' && (
                  <button onClick={() => handlePublish(exam.id)}
                    className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5 bg-green-600 hover:bg-green-700">
                    <FiSend size={12} /> Publish
                  </button>
                )}
                <button onClick={() => handleDelete(exam.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-gray-400 hover:text-red-500">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
