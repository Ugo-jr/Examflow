import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiLayers, FiTrash2 } from 'react-icons/fi'
import { userService } from '../../services'
import Modal from '../../components/shared/Modal'
import toast from 'react-hot-toast'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '' })

  const load = () => {
    setLoading(true)
    userService.departments().then(r => setDepartments(r.data.results || r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await userService.createDepartment(form)
      toast.success('Department created')
      setModalOpen(false)
      setForm({ name: '', code: '', description: '' })
      load()
    } catch {
      toast.error('Failed to create department')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{departments.length} departments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Department
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
      ) : departments.length === 0 ? (
        <div className="card p-16 text-center">
          <FiLayers size={48} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
          <p className="text-gray-500">No departments yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {departments.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-3">
                <FiLayers className="text-orange-600" size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{d.code}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{d.description || 'No description'}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Department">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="input-field" placeholder="CS" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
          </div>
          <button type="submit" className="btn-primary w-full">Create Department</button>
        </form>
      </Modal>
    </div>
  )
}
