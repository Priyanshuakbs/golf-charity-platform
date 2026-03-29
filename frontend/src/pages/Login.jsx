import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Target, ArrowRight, Loader2 } from 'lucide-react'

/* ── Floating animated number balls in background ── */
function FloatingBalls() {
  const balls = [7, 23, 31, 14, 42, 5, 19, 38, 11, 27]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {balls.map((num, i) => (
        <div
          key={i}
          className="absolute w-10 h-10 rounded-full border border-white/[0.07] flex items-center justify-center text-xs font-mono text-white/10"
          style={{
            left: `${8 + (i * 9.5) % 88}%`,
            top: `${5 + (i * 17) % 85}%`,
            animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            background: i % 3 === 0
              ? 'rgba(34,197,94,0.04)'
              : i % 3 === 1
              ? 'rgba(245,158,11,0.04)'
              : 'rgba(255,255,255,0.02)',
          }}
        >
          {num}
        </div>
      ))}
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name?.split(' ')[0]}! 👋`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex hero-gradient relative">
      <FloatingBalls />

      {/* ── Left panel — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative border-r border-white/[0.06]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateX(-20px)',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group w-fit">
          <div className="w-9 h-9 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-green-400" />
          </div>
          <span className="font-display text-2xl text-white tracking-wide">
            GOLF<span className="text-green-400">DRAW</span>
          </span>
        </Link>

        {/* Centre quote */}
        <div>
          <div className="mb-8">
            {/* Animated draw balls */}
            <div className="flex gap-3 mb-10">
              {[7, 14, 23, 31, 42].map((n, i) => (
                <div
                  key={n}
                  className="w-12 h-12 rounded-full border-2 border-green-500/30 bg-green-500/10 flex items-center justify-center font-mono font-bold text-green-400 text-sm"
                  style={{
                    animation: 'float 3s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
            <h2 className="font-display text-5xl text-white leading-tight mb-4">
              EVERY SWING<br />
              <span className="gradient-text">COUNTS.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-xs">
              Submit your scores, enter monthly draws, and donate to the charity you love.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: '£9.99', label: 'per month' },
              { val: '10%+', label: 'to charity' },
              { val: 'Monthly', label: 'draws' },
            ].map(({ val, label }) => (
              <div key={label} className="card p-4 text-center">
                <p className="font-display text-2xl gradient-text">{val}</p>
                <p className="text-xs text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-700">© 2025 GolfDraw · All rights reserved</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div
          className="w-full max-w-md"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(24px)',
            transition: 'all 0.7s ease 0.1s',
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-green-400" />
              </div>
              <span className="font-display text-2xl text-white">GOLF<span className="text-green-400">DRAW</span></span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl text-white tracking-wide mb-2">SIGN IN</h1>
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Create one free →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-green-400' : 'text-gray-600'
                  }`}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label !mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-600 hover:text-green-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-green-400' : 'text-gray-600'
                  }`}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handle}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="input-field pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 flex items-center justify-center gap-2 mt-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'rgba(34,197,94,0.6)' : undefined,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-700">or continue with</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Register CTA */}
          <Link
            to="/register"
            className="btn-secondary w-full !py-4 flex items-center justify-center gap-2 text-sm text-center"
          >
            Create a new account
          </Link>

          {/* Demo hint */}
          <p className="text-center text-xs text-gray-700 mt-6">
            Demo: <span className="text-gray-500 font-mono">admin@golf.com</span> /
            <span className="text-gray-500 font-mono"> admin123</span>
          </p>
        </div>
      </div>
    </div>
  )
}