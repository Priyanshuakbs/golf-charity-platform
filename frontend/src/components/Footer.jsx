import { Link } from 'react-router-dom'
import { Target, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] bg-[#060810]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-display text-xl text-white tracking-wide">
                GOLF<span className="text-green-400">DRAW</span>
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mb-5">
              Where every swing creates real change. Track your golf, win prizes, and support the charities you love.
            </p>
            <div className="flex gap-2">
              {['Twitter', 'Instagram', 'Facebook'].map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 bg-white/[0.04] border border-white/[0.06] rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-all duration-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                ['/', 'Home'],
                ['/charities', 'Charities'],
                ['/draws', 'Draw Results'],
                ['/subscription', 'Subscribe'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-4">Account</p>
            <ul className="space-y-2.5">
              {[
                ['/login',     'Sign In'],
                ['/register',  'Register'],
                ['/dashboard', 'Dashboard'],
                ['/scores',    'My Scores'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">© {year} GolfDraw Platform. All rights reserved.</p>
          <p className="text-xs text-gray-700 flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-500/60" /> for golfers who give back
          </p>
        </div>
      </div>
    </footer>
  )
}