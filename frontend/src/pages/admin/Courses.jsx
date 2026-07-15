import { useEffect, useState } from 'react'
import { FiBook, FiUsers, FiTrash2 } from 'react-icons/fi'
import { courseService } from '../../services'
import DataTable from '../../components/shared/DataTable'
import toast from 'react-hot-toast'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    courseService.list().then(r => setCourses(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    await courseService.delete(id)
    toast.success('Course deleted')
    load()
  }

  const columns = [
    { key: 'title', label: 'Course', render: (v, row) => (
      <div><p className="font-medium text-gray-900 dark:text-gray-100">{v}</p><p className="text-xs text-gray-500">{row.code}</p></div>
    )},
    { key: 'instructor_name', label: 'Instructor' },
    { key: 'department_name', label: 'Department' },
    { key: 'enrolled_count', label: 'Students', render: (v) => <span className="flex items-center gap-1"><FiUsers size={12} />{v}</span> },
    { key: 'is_active', label: 'Status', render: (v) => <span className={v ? 'badge-green' : 'badge-red'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'id', label: '', render: (v) => (
      <button onClick={() => handleDelete(v)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500">
        <FiTrash2 size={14} />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{courses.length} courses across the platform</p>
      </div>
      <div className="card p-6">
        <DataTable columns={columns} data={courses} loading={loading} />
      </div>
    </div>
  )
}
