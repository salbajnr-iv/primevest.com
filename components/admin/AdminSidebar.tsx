'use client'

import Link from 'next/link'

interface Props {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminSidebar({ isOpen, onToggle }: Props) {
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 transition-all ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        {isOpen ? <span className="text-white font-semibold">Admin</span> : null}
        <button onClick={onToggle} className="text-gray-300">☰</button>
      </div>
      <nav className="px-3 space-y-2 text-sm">
        <Link href="/admin/dashboard" className="block rounded px-3 py-2 text-gray-200 hover:bg-gray-800">Dashboard</Link>
        <Link href="/admin/users" className="block rounded px-3 py-2 text-gray-200 hover:bg-gray-800">Users</Link>
        <Link href="/admin/settings" className="block rounded px-3 py-2 text-gray-200 hover:bg-gray-800">Settings</Link>
      </nav>
    </aside>
  )
}
