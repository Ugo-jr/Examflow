import { useEffect, useState } from 'react'
import { FiDownload, FiFileText } from 'react-icons/fi'
import { examService, resultService } from '../../services'
import DataTable from '../../components/shared/DataTable'
import toast from 'react-hot-toast'

export default function ViewResults() {
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    examService.list().then(r => setExams(r.data.results || r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    resultService.list(selectedExam ? { exam: selectedExam } : {}).then(r => {
      setResults(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }, [selectedExam])

  const download = async (type) => {
    try {
      const fn = type === 'pdf' ? resultService.exportPdf : resultService.exportExcel
      const { data } = await fn(selectedExam)
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `results.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      toast.success(`Exported as ${type.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    }
  }

  const columns = [
    { key: 'student_name', label: 'Student', render: (v, row) => (
      <div><p className="font-medium text-gray-900 dark:text-gray-100">{v}</p><p className="text-xs text-gray-500">{row.student_email}</p></div>
    )},
    { key: 'exam_title', label: 'Exam' },
    { key: 'percentage', label: 'Score', render: (v) => `${parseFloat(v).toFixed(1)}%` },
    { key: 'passed', label: 'Status', render: (v) => <span className={v ? 'badge-green' : 'badge-red'}>{v ? 'Passed' : 'Failed'}</span> },
    { key: 'time_taken_formatted', label: 'Time' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Results</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{results.length} results</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="input-field py-2 text-sm w-48">
            <option value="">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={() => download('excel')} className="btn-secondary flex items-center gap-1.5 text-sm px-3">
            <FiDownload size={14} /> Excel
          </button>
          <button onClick={() => download('pdf')} className="btn-secondary flex items-center gap-1.5 text-sm px-3">
            <FiDownload size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="card p-6">
        <DataTable columns={columns} data={results} loading={loading} />
      </div>
    </div>
  )
}
