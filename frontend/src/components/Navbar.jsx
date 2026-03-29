import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Build full avatar URL from relative path
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${base}/${avatar}`
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [imgError, setImgError]   = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  // Reset image error when user avatar changes
  useEffect(() => { setImgError(false) }, [user?.avatar])

  const handleLogout = () => { logout(); navigate('/') }

  const avatarUrl = getAvatarUrl(user?.avatar)
  const initial   = user?.name?.[0]?.toUpperCase()

  // Reusable avatar circle
  const AvatarCircle = ({ size = 'w-7 h-7', textSize = 'text-xs' }) => (
    <div className={`${size} rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {avatarUrl && !imgError
        ? <img
            src={avatarUrl}
            alt={user?.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        : <span className={`text-green-400 ${textSize} font-semibold`}>{initial}</span>
      }
    </div>
  )

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/5 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <span className="text-black font-bold text-sm font-mono">G</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Golf<span className="text-green-400">Draw</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/charities" className="text-sm text-gray-400 hover:text-white transition-colors">Charities</Link>
          <Link to="/draws"     className="text-sm text-gray-400 hover:text-white transition-colors">Draw Results</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">Admin</Link>
              )}

              {/* User dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  {/* FIX: show avatar image if available, else initial */}
                  <AvatarCircle size="w-7 h-7" textSize="text-xs" />
                  {user?.name?.split(' ')[0]}
                </button>

                <div className="absolute right-0 top-full mt-2 w-52 bg-[#111] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {/* User info header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <AvatarCircle size="w-9 h-9" textSize="text-sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Profile</Link>
                  <Link to="/scores"  className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Scores</Link>
                  <Link to="/my-wins" className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">My Wins</Link>
                  <hr className="border-white/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-b-xl transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login"    className="text-sm text-gray-400 hover:text-white transition-colors">Sign in</Link>
              <Link to="/register" className="text-sm bg-green-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`w-5 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-white mt-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white mt-1 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#111] border-t border-white/5 px-6 py-4 space-y-3">
          {/* Mobile user info */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-1">
              <AvatarCircle size="w-10 h-10" textSize="text-sm" />
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          )}

          <Link to="/charities" className="block py-2 text-gray-400 hover:text-white transition-colors">Charities</Link>
          <Link to="/draws"     className="block py-2 text-gray-400 hover:text-white transition-colors">Draw Results</Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block py-2 text-gray-400 hover:text-white">Dashboard</Link>
              <Link to="/scores"    className="block py-2 text-gray-400 hover:text-white">Scores</Link>
              <Link to="/my-wins"   className="block py-2 text-gray-400 hover:text-white">My Wins</Link>
              <Link to="/profile"   className="block py-2 text-gray-400 hover:text-white">Profile</Link>
              {isAdmin && (
                <Link to="/admin" className="block py-2 text-yellow-400">Admin Panel</Link>
              )}
              <button onClick={handleLogout} className="block py-2 text-red-400 w-full text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block py-2 text-gray-400 hover:text-white">Sign in</Link>
              <Link to="/register" className="block py-2 text-green-400 font-semibold">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}