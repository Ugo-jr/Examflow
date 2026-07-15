/**
 * ExamInterface — Full exam-taking experience
 * Sidebar question nav, timer, auto-save every 30s, auto-submit on timeout
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiFlag, FiChevronLeft, FiChevronRight, FiClock, FiCheck,
  FiAlertCircle, FiGrid, FiX, FiSend
} from 'react-icons/fi'
import { examService } from '../../services'
import toast from 'react-hot-toast'
import Modal from '../../components/shared/Modal'

export default function ExamInterface() {
  const { examId } = useParams()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: [optionIds] }
  const [flagged, setFlagged] = useState({}) // { questionId: bool }
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  const autoSaveRef = useRef(null)
  const timerRef = useRef(null)
  const answersRef = useRef(answers)
  const flaggedRef = useRef(flagged)
  answersRef.current = answers
  flaggedRef.current = flagged

  // Start exam attempt
  useEffect(() => {
    examService.start(examId).then(({ data }) => {
      setExam(data.exam)
      setAttemptId(data.attempt_id)
      const startedAt = new Date(data.started_at).getTime()
      const durationMs = data.exam.duration_minutes * 60 * 1000
      const elapsed = Date.now() - startedAt
      setTimeLeft(Math.max(0, Math.floor((durationMs - elapsed) / 1000)))
    }).catch((err) => {
      toast.error(err.response?.data?.detail || 'Could not start exam')
      navigate('/student/exams')
    }).finally(() => setLoading(false))
  }, [examId])

  // Countdown timer
  useEffect(() => {
    if (!exam || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleAutoSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [exam])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!exam || !attemptId) return
    autoSaveRef.current = setInterval(() => {
      saveAllAnswers(true)
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [exam, attemptId])

  const saveAllAnswers = useCallback(async (silent = false) => {
    if (!exam) return
    const promises = Object.keys(answersRef.current).map(qId =>
      examService.saveAnswer(examId, {
        attempt_id: attemptId,
        question_id: parseInt(qId),
        selected_option_ids: answersRef.current[qId] || [],
        is_flagged: !!flaggedRef.current[qId],
      })
    )
    try {
      await Promise.all(promises)
      if (!silent) toast.success('Progress saved')
    } catch {
      if (!silent) toast.error('Failed to save')
    }
  }, [exam, attemptId, examId])

  const handleAutoSubmit = async () => {
    await saveAllAnswers(true)
    toast('Time is up! Auto-submitting your exam.', { icon: '⏰' })
    await doSubmit()
  }

  const doSubmit = async () => {
    setSubmitting(true)
    try {
      await saveAllAnswers(true)
      const { data } = await examService.submit(examId, attemptId)
      navigate(`/exam/result/${data.result_id}`)
    } catch {
      toast.error('Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  const toggleOption = (questionId, optionId, questionType) => {
    setAnswers(prev => {
      const current = prev[questionId] || []
      if (questionType === 'multi_select') {
        const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId]
        return { ...prev, [questionId]: next }
      }
      return { ...prev, [questionId]: [optionId] }
    })
  }

  const toggleFlag = (questionId) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  if (loading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading exam...</p>
        </div>
      </div>
    )
  }

  const questions = exam.questions || []
  const currentQ = questions[currentIdx]
  const answeredCount = Object.keys(answers).filter(k => (answers[k] || []).length > 0).length
  const progress = (answeredCount / questions.length) * 100

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const isUrgent = timeLeft < 300 // last 5 minutes

  const QuestionNav = ({ mobile = false }) => (
    <div className={mobile ? '' : 'card p-4'}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</p>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, i) => {
          const isAnswered = (answers[q.id] || []).length > 0
          const isFlag = flagged[q.id]
          const isCurrent = i === currentIdx
          return (
            <button
              key={q.id}
              onClick={() => { setCurrentIdx(i); setNavOpen(false) }}
              className={`relative w-10 h-10 rounded-xl text-sm font-semibold flex items-center justify-center transition-all
                ${isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-900' : ''}
                ${isAnswered ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}
              `}
            >
              {i + 1}
              {isFlag && <FiFlag size={9} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" />}
            </button>
          )
        })}
      </div>
      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30" /> Answered</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800" /> Unanswered</div>
        <div className="flex items-center gap-2"><FiFlag size={11} className="text-amber-500" /> Flagged</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate max-w-xs sm:max-w-md">{exam.title}</p>
          <p className="text-xs text-gray-500">{answeredCount}/{questions.length} answered</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setNavOpen(true)} className="lg:hidden btn-secondary p-2.5">
            <FiGrid size={16} />
          </button>
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-mono font-bold text-sm sm:text-base
            ${isUrgent ? 'bg-red-50 text-red-600 dark:bg-red-900/20 animate-pulse' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'}`}>
            <FiClock size={16} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100 dark:bg-gray-800">
        <motion.div className="h-full bg-indigo-600" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <QuestionNav />
          </div>
        </div>

        {/* Main question panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="card p-6 sm:p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="badge badge-blue mb-2">Question {currentIdx + 1} of {questions.length}</span>
                  <p className="text-xs text-gray-500">{currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`p-2.5 rounded-xl transition-colors ${flagged[currentQ.id] ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 hover:text-amber-500'}`}
                  title="Flag this question"
                >
                  <FiFlag size={16} className={flagged[currentQ.id] ? 'fill-amber-500' : ''} />
                </button>
              </div>

              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
                {currentQ.text}
              </h2>

              {currentQ.image && (
                <img src={currentQ.image} alt="question" className="rounded-xl mb-6 max-h-64 object-contain" />
              )}

              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const selected = (answers[currentQ.id] || []).includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(currentQ.id, opt.id, currentQ.question_type)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3
                        ${selected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-semibold
                        ${currentQ.question_type === 'multi_select' ? 'rounded-md' : 'rounded-full'}
                        ${selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {selected ? <FiCheck size={13} /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-sm ${selected ? 'text-indigo-900 dark:text-indigo-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-40"
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            {currentIdx === questions.length - 1 ? (
              <button onClick={() => setSubmitModalOpen(true)} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <FiSend size={15} /> Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
                className="btn-primary flex items-center gap-2"
              >
                Next <FiChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setNavOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 z-50 p-6 lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-gray-900 dark:text-white">Question Navigator</p>
                <button onClick={() => setNavOpen(false)}><FiX size={20} className="text-gray-500" /></button>
              </div>
              <QuestionNav mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submit confirmation modal */}
      <Modal open={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Submit Exam?" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {answeredCount} of {questions.length} questions answered
              </p>
              {answeredCount < questions.length && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Once submitted, you cannot change your answers. Your exam will be graded automatically.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setSubmitModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={doSubmit} disabled={submitting} className="btn-primary flex-1 bg-green-600 hover:bg-green-700">
              {submitting ? 'Submitting...' : 'Confirm Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
