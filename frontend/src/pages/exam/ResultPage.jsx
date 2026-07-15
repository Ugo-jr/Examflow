/**
 * ResultPage — Instant grading display + answer review
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiAward, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft,
  FiCheck, FiX, FiHelpCircle
} from 'react-icons/fi'
import { resultService } from '../../services'

export default function ResultPage() {
  const { resultId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => {
    resultService.review(resultId).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [resultId])

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { result, answers } = data
  const passed = result.passed

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
          <FiArrowLeft size={15} /> Back to Dashboard
        </button>

        {/* Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`card p-8 text-center mb-6 relative overflow-hidden ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'}`}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}
          >
            {passed ? <FiCheckCircle className="text-green-600" size={40} /> : <FiXCircle className="text-red-500" size={40} />}
          </motion.div>
          <h1 className={`text-3xl font-bold mb-1 ${passed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {passed ? 'Congratulations!' : 'Keep Practicing'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{result.exam_title}</p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            {parseFloat(result.percentage).toFixed(1)}%
          </motion.div>
          <span className={passed ? 'badge-green text-sm py-1 px-3' : 'badge-red text-sm py-1 px-3'}>
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Score', value: `${result.score}/${result.total_marks}`, icon: FiAward, color: 'indigo' },
            { label: 'Correct', value: result.correct_answers, icon: FiCheck, color: 'green' },
            { label: 'Wrong', value: result.wrong_answers, icon: FiX, color: 'red' },
            { label: 'Time Taken', value: result.time_taken_formatted, icon: FiClock, color: 'blue' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="card p-4 text-center">
              <stat.icon className={`mx-auto mb-2 text-${stat.color}-600`} size={18} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <button onClick={() => setShowReview(s => !s)} className="btn-secondary w-full mb-6">
          {showReview ? 'Hide' : 'Review'} Answers
        </button>

        {/* Answer review */}
        {showReview && (
          <div className="space-y-4">
            {answers.map((ans, i) => (
              <motion.div key={ans.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="badge badge-blue">Q{i + 1} • {ans.marks} mark{ans.marks !== 1 ? 's' : ''}</span>
                  {ans.is_correct ? (
                    <span className="badge-green flex items-center gap-1"><FiCheck size={11} /> Correct</span>
                  ) : (
                    <span className="badge-red flex items-center gap-1"><FiX size={11} /> Incorrect</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">{ans.question_text}</p>
                <div className="space-y-2">
                  {ans.all_options.map(opt => (
                    <div key={opt.id} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm
                      ${opt.is_correct ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        opt.was_selected ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                        'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {opt.is_correct ? <FiCheck size={14} /> : opt.was_selected ? <FiX size={14} /> : <span className="w-3.5" />}
                      {opt.text}
                      {opt.was_selected && <span className="ml-auto text-xs opacity-70">Your answer</span>}
                    </div>
                  ))}
                </div>
                {ans.explanation && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FiHelpCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                    <p className="text-xs text-blue-700 dark:text-blue-400">{ans.explanation}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
