import { useEffect, useState } from 'react'
import { FiUserCheck, FiUserX, FiTrash2, FiUsers } from 'react-icons/fi'
import { userService } from '../../services'
import DataTable from '../../components/shared/DataTable'
import toast from 'react-hot-toast'

const ROLE_BADGE = { student: 'badge-blue', instructor: 'badge-purple', admin: 'badge-yellow' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  const load = () => {
    setLoading(true)
    userService.list(roleFilter ? { role: roleFilter } : {}).then(r => {
      setUsers(r.data.results || r.data)
    }).finally(() => setLoading(false))
  }
  useEffect(load, [roleFilter])

  const toggleActive = async (id) => {
    await userService.toggleActive(id)
    load()
    toast.success('User status updated')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    await userService.delete(id)
    toast.success('User deleted')
    load()
  }

  const columns = [
    { key: 'full_name', label: 'Name', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {row.first_name?.[0]}{row.last_name?.[0]}
        </div>
        <div><p className="font-medium text-gray-900 dark:text-gray-100">{v}</p><p className="text-xs text-gray-500">{row.email}</p></div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v) => <span className={`${ROLE_BADGE[v]} capitalize`}>{v}</span> },
    { key: 'department_name', label: 'Department' },
    { key: 'is_active', label: 'Status', render: (v) => <span className={v ? 'badge-green' : 'badge-red'}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'id', label: 'Actions', render: (v, row) => (
      <div className="flex gap-1">
        <button onClick={() => toggleActive(v)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-600" title="Toggle status">
          {row.is_active ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
        </button>
        <button onClick={() => handleDelete(v)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500">
          <FiTrash2 size={14} />
        </button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{users.length} users</p>
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field py-2 text-sm w-48">
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="instructor">Instructors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card p-6">
        <DataTable columns={columns} data={users} loading={loading} />
      </div>
    </div>
  )
}
