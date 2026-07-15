import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { examService, courseService } from '../../services'
import toast from 'react-hot-toast'

export default function CreateExam() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', course: '', duration_minutes: 60,
    passing_score: 50, total_marks: 100, instructions: '',
    shuffle_questions: false, shuffle_options: false,
    show_results_immediately: true, max_attempts: 1,
    start_datetime: '', end_datetime: '',
  })

  useEffect(() => {
    courseService.myCourses().then(r => setCourses(r.data))
  }, [])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.start_datetime) delete payload.start_datetime
      if (!payload.end_datetime) delete payload.end_datetime
      const { data } = await examService.create(payload)
      toast.success('Exam created! Now add questions.')
      navigate(`/instructor/exams/${data.id}/questions`)
    } catch (err) {
      toast.error('Failed to create exam')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/instructor/exams')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <FiArrowLeft size={15} /> Back to Exams
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Exam</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Configure the exam settings</p>
      </div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Exam Title</label>
          <input value={form.title} onChange={set('title')} className="input-field" placeholder="Midterm Exam - Data Structures" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course</label>
          <select value={form.course} onChange={set('course')} className="input-field" required>
            <option value="">Select a course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={2} className="input-field resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instructions for Students</label>
          <textarea value={form.instructions} onChange={set('instructions')} rows={3} className="input-field resize-none"
            placeholder="Read each question carefully. You may flag questions to review later..." />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (min)</label>
            <input type="number" value={form.duration_minutes} onChange={set('duration_minutes')} className="input-field" min={1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Marks</label>
            <input type="number" value={form.total_marks} onChange={set('total_marks')} className="input-field" min={1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Passing Score (%)</label>
            <input type="number" value={form.passing_score} onChange={set('passing_score')} className="input-field" min={0} max={100} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date (optional)</label>
            <input type="datetime-local" value={form.start_datetime} onChange={set('start_datetime')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date (optional)</label>
            <input type="datetime-local" value={form.end_datetime} onChange={set('end_datetime')} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Attempts</label>
          <input type="number" value={form.max_attempts} onChange={set('max_attempts')} className="input-field w-32" min={1} />
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          {[
            ['shuffle_questions', 'Shuffle question order'],
            ['shuffle_options', 'Shuffle answer options'],
            ['show_results_immediately', 'Show results immediately after submission'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[key]} onChange={set(key)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          <FiSave size={16} /> {saving ? 'Creating...' : 'Create Exam & Add Questions'}
        </button>
      </motion.form>
    </div>
  )
}
