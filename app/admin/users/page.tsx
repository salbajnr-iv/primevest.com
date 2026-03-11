'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'
interface UserProfile {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()
      if (!supabase) {
        setUsers([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      setUsers((data as UserProfile[]) || [])
      setLoading(false)
    }

    run()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <div className="overflow-auto rounded-xl border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 text-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-800">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.full_name || '—'}</td>
                <td className="px-4 py-3">{user.is_active ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
