import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import AdminUsers     from './AdminUsers'
import AdminDraws     from './AdminDraws'
import AdminCharities from './AdminCharities'
import AdminWinners   from './AdminWinners'

const tabs = [
  { to: '/admin',            label: '📊 Dashboard' },
  { to: '/admin/users',      label: '👥 Users' },
  { to: '/admin/draws',      label: '🎯 Draws' },
  { to: '/admin/charities',  label: '🏥 Charities' },
  { to: '/admin/winners',    label: '🏆 Winners' },
]

export default function AdminPanel() {
  const { pathname } = useLocation()

  return (
    <div className="pt-20">
      {/* Admin tab bar */}
      <div className="border-b border-white/[0.06] bg-black/30 backdrop-blur sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(({ to, label }) => {
            const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? 'border-green-400 text-green-400'
                    : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Nested routes */}
      <Routes>
        <Route index             element={<AdminDashboard />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="draws"      element={<AdminDraws />} />
        <Route path="charities"  element={<AdminCharities />} />
        <Route path="winners"    element={<AdminWinners />} />
        <Route path="*"          element={<Navigate to="/admin" replace />} />
      </Routes>
    </div>
  )
}