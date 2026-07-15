import { useEffect, useState } from 'react'
import { FiFileText, FiTrash2 } from 'react-icons/fi'
import { examService } from '../../services'
import DataTable from '../../components/shared/DataTable'
import toast from 'react-hot-toast'

const STATUS_BADGE = { draft: 'badge-yellow', published: 'badge-green', closed: 'badge-red' }

export default function AdminExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    examService.list().then(r => setExams(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return
    await examService.delete(id)
    toast.success('Exam deleted')
    load()
  }

  const columns = [
    { key: 'title', label: 'Exam', render: (v, row) => (
      <div><p className="font-medium text-gray-900 dark:text-gray-100">{v}</p><p className="text-xs text-gray-500">{row.course_title}</p></div>
    )},
    { key: 'instructor_name', label: 'Instructor' },
    { key: 'status', label: 'Status', render: (v) => <span className={STATUS_BADGE[v]}>{v}</span> },
    { key: 'question_count', label: 'Questions' },
    { key: 'duration_minutes', label: 'Duration', render: (v) => `${v} min` },
    { key: 'id', label: '', render: (v) => (
      <button onClick={() => handleDelete(v)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500">
        <FiTrash2 size={14} />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Exams</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{exams.length} exams across the platform</p>
      </div>
      <div className="card p-6">
        <DataTable columns={columns} data={exams} loading={loading} />
      </div>
    </div>
  )
}
