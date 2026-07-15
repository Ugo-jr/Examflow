import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiSend, FiCheck, FiX } from 'react-icons/fi'
import { examService, questionService } from '../../services'
import Modal from '../../components/shared/Modal'
import toast from 'react-hot-toast'

const EMPTY_OPTION = () => ({ text: '', is_correct: false, order: 0 })

export default function ExamQuestions() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ text: '', question_type: 'mcq', marks: 1, explanation: '', options: [EMPTY_OPTION(), EMPTY_OPTION()] })

  const load = () => {
    setLoading(true)
    Promise.all([
      examService.get(examId),
      questionService.list(examId),
    ]).then(([examRes, qRes]) => {
      setExam(examRes.data)
      setQuestions(qRes.data.results || qRes.data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [examId])

  const openCreate = () => {
    setEditing(null)
    setForm({ text: '', question_type: 'mcq', marks: 1, explanation: '', options: [EMPTY_OPTION(), EMPTY_OPTION()] })
    setModalOpen(true)
  }

  const openEdit = (q) => {
    setEditing(q)
    setForm({
      text: q.text, question_type: q.question_type, marks: q.marks, explanation: q.explanation || '',
      options: q.options.map(o => ({ text: o.text, is_correct: o.is_correct, order: o.order })),
    })
    setModalOpen(true)
  }

  const updateOption = (idx, field, value) => {
    setForm(f => {
      const options = [...f.options]
      if (field === 'is_correct' && f.question_type !== 'multi_select') {
        // single-select: only one correct answer
        options.forEach((o, i) => { o.is_correct = i === idx ? value : false })
      } else {
        options[idx] = { ...options[idx], [field]: value }
      }
      return { ...f, options }
    })
  }

  const addOption = () => setForm(f => ({ ...f, options: [...f.options, EMPTY_OPTION()] }))
  const removeOption = (idx) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.options.some(o => o.is_correct)) {
      toast.error('Mark at least one option as correct')
      return
    }
    const payload = {
      exam: examId, text: form.text, question_type: form.question_type,
      marks: form.marks, explanation: form.explanation,
      order: editing ? editing.order : questions.length + 1,
      options: form.options.map((o, i) => ({ ...o, order: i })),
    }
    try {
      if (editing) {
        await questionService.update(editing.id, payload)
        toast.success('Question updated')
      } else {
        await questionService.create(payload)
        toast.success('Question added')
      }
      setModalOpen(false)
      load()
    } catch {
      toast.error('Failed to save question')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await questionService.delete(id)
    toast.success('Question deleted')
    load()
  }

  const handlePublish = async () => {
    try {
      await examService.publish(examId)
      toast.success('Exam published!')
      navigate('/instructor/exams')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish')
    }
  }

  if (loading) return <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/instructor/exams')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
        <FiArrowLeft size={15} /> Back to Exams
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{questions.length} questions • {exam.status}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openCreate} className="btn-secondary flex items-center gap-2">
            <FiPlus size={16} /> Add Question
          </button>
          {exam.status === 'draft' && (
            <button onClick={handlePublish} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <FiSend size={15} /> Publish Exam
            </button>
          )}
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-gray-500 mb-4">No questions yet</p>
          <button onClick={openCreate} className="btn-primary">Add your first question</button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="badge badge-blue">Q{i + 1} • {q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(q)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{q.text}</p>
              <div className="space-y-1.5">
                {q.options.map(opt => (
                  <div key={opt.id} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${opt.is_correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {opt.is_correct ? <FiCheck size={11} /> : <FiX size={11} className="opacity-30" />}
                    {opt.text}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Question' : 'Add Question'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Question Text</label>
            <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={2} className="input-field resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Question Type</label>
              <select value={form.question_type} onChange={e => setForm(f => ({ ...f, question_type: e.target.value }))} className="input-field">
                <option value="mcq">Multiple Choice (single answer)</option>
                <option value="multi_select">Multi-Select (multiple answers)</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Marks</label>
              <input type="number" value={form.marks} onChange={e => setForm(f => ({ ...f, marks: parseInt(e.target.value) }))} className="input-field" min={1} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer Options</label>
            <div className="space-y-2">
              <AnimatePresence>
                {form.options.map((opt, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <button type="button" onClick={() => updateOption(idx, 'is_correct', !opt.is_correct)}
                      className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors ${opt.is_correct ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                      <FiCheck size={14} />
                    </button>
                    <input value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} className="input-field py-2 flex-1" placeholder={`Option ${idx + 1}`} required />
                    {form.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(idx)} className="p-2 text-gray-400 hover:text-red-500">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button type="button" onClick={addOption} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
              <FiPlus size={14} /> Add Option
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Explanation (shown after grading)</label>
            <textarea value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} rows={2} className="input-field resize-none" />
          </div>

          <button type="submit" className="btn-primary w-full">{editing ? 'Update Question' : 'Add Question'}</button>
        </form>
      </Modal>
    </div>
  )
}
