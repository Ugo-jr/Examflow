import { useState } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function DataTable({ columns, data, loading, searchable = true, itemsPerPage = 10 }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = searchable ? data.filter(row =>
    Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  ) : data

  const total = Math.ceil(filtered.length / itemsPerPage)
  const paged = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9 py-2.5 text-sm"
            placeholder="Search..."
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columns.map(col => (
                <th key={col.key} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                  {columns.map(col => (
                    <td key={col.key} className="py-3 px-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                  No data found
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <motion.tr
                key={row.id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {columns.map(col => (
                  <td key={col.key} className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, total) }, (_, i) => i + Math.max(1, page - 2)).filter(p => p <= total).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 text-gray-600 dark:text-gray-400">
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
