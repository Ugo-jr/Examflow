import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiUsers, FiBook, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { courseService } from '../../services'
import Modal from '../../components/shared/Modal'
import toast from 'react-hot-toast'

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', code: '', description: '' })

  const load = () => {
    setLoading(true)
    courseService.myCourses().then(r => setCourses(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm({ title: '', code: '', description: '' }); setModalOpen(true) }
  const openEdit = (course) => { setEditing(course); setForm({ title: course.title, code: course.code, description: course.description }); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await courseService.update(editing.id, form)
        toast.success('Course updated')
      } else {
        await courseService.create(form)
        toast.success('Course created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.code?.[0] || 'Failed to save course')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    await courseService.delete(id)
    toast.success('Course deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Course
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : courses.length === 0 ? (
        <div className="card p-16 text-center">
          <FiBook size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 mb-4">No courses yet</p>
          <button onClick={openCreate} className="btn-primary">Create your first course</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FiBook className="text-blue-600" size={18} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(course)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{course.code}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{course.description || 'No description'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FiUsers size={12} /> {course.enrolled_count} students enrolled
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Create Course'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="input-field" placeholder="CS101" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
          </div>
          <button type="submit" className="btn-primary w-full">{editing ? 'Update Course' : 'Create Course'}</button>
        </form>
      </Modal>
    </div>
  )
}
