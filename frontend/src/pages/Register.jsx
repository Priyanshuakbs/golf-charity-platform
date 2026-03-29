import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Eye, EyeOff, Mail, Lock, User, Target,
  ArrowRight, Loader2, Check, X, Trophy, Heart, Zap
} from 'lucide-react'

function PasswordStrength({ password }) {
  const checks = [
    { label: '6+ characters',    pass: password.length >= 6 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number',           pass: /[0-9]/.test(password) },
  ]
  const score  = checks.filter((c) => c.pass).length
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-green-500']
  const labels = ['Weak', 'Fair', 'Strong']
  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 h-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < score ? colors[score - 1] : 'bg-white/10'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, pass }) => (
            <div key={label} className="flex items-center gap-1">
              {pass ? <Check className="w-3 h-3 text-green-400" /> : <X className="w-3 h-3 text-gray-600" />}
              <span className={`text-xs ${pass ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
            </div>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-medium ${colors[score - 1].replace('bg-', 'text-')}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  )
}

function FeaturePill({ icon: Icon, text, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {text}
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]           = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [step, setStep]           = useState(0)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    setTimeout(() => setStep(1), 200)
    setTimeout(() => setStep(2), 400)
    setTimeout(() => setStep(3), 600)
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password)
      toast.success(`Welcome to GolfDraw, ${user.name?.split(' ')[0]}! 🎉`)
      navigate('/subscription')
    } catch (err) {
      toast.error(err.message || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword

  return (
    <div className="min-h-screen flex hero-gradient relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/4 rounded-full blur-3xl" />
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        <div className="w-full max-w-md" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(24px)', transition: 'all 0.6s ease' }}>

          <div className="flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-green-400" />
              </div>
              <span className="font-display text-2xl text-white tracking-wide">
                GOLF<span className="text-green-400">DRAW</span>
              </span>
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="font-display text-4xl text-white tracking-wide mb-2">CREATE ACCOUNT</h1>
            <p className="text-gray-500 text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">Sign in →</Link>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">

            {/* Name */}
            <div style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'none' : 'translateY(12px)', transition: 'all 0.4s ease' }}>
              <label className="label">Full name</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'name' ? 'text-green-400' : 'text-gray-600'}`} />
                <input
                  type="text" name="name" value={form.name} onChange={handle} required autoComplete="name"
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  placeholder="John Smith" className="input-field pl-11"
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'none' : 'translateY(12px)', transition: 'all 0.4s ease 0.05s' }}>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-green-400' : 'text-gray-600'}`} />
                <input
                  type="email" name="email" value={form.email} onChange={handle} required autoComplete="email"
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com" className="input-field pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'none' : 'translateY(12px)', transition: 'all 0.4s ease' }}>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-green-400' : 'text-gray-600'}`} />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                  required minLength={6} autoComplete="new-password"
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  placeholder="Min. 6 characters" className="input-field pl-11 pr-12"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'none' : 'translateY(12px)', transition: 'all 0.4s ease' }}>
              <label className="label">Confirm password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'confirm' ? 'text-green-400' : 'text-gray-600'}`} />
                <input
                  type={showPass ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handle}
                  required autoComplete="new-password"
                  onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)}
                  placeholder="Repeat your password"
                  className={`input-field pl-11 pr-12 transition-all duration-300 ${
                    form.confirmPassword ? passwordsMatch ? 'border-green-500/40' : 'border-red-500/40' : ''
                  }`}
                />
                {form.confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {passwordsMatch ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
                  </div>
                )}
              </div>
              {form.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              By creating an account you agree to our{' '}
              <span className="text-gray-500 hover:text-green-400 cursor-pointer transition-colors">Terms of Service</span>
              {' '}and{' '}
              <span className="text-gray-500 hover:text-green-400 cursor-pointer transition-colors">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading || (form.confirmPassword && !passwordsMatch)}
              className="btn-primary w-full !py-4 flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
              ) : (
                <>Create Account<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-700 mt-6">
            Secured with 256-bit encryption · No card required
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="hidden lg:flex flex-col justify-center w-[42%] p-12 relative border-l border-white/[0.06]"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateX(20px)', transition: 'all 0.7s ease 0.15s' }}
      >
        <div className="mb-10">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">This month's draw</p>
          <div className="flex gap-3">
            {[14, 27, 33, 9, 41].map((n, i) => (
              <div key={n} className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center font-mono font-bold text-green-400 text-sm"
                style={{ animation: `float ${3 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}>
                {n}
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-display text-5xl text-white leading-tight mb-4">
          JOIN THE<br /><span className="gradient-text">COMMUNITY.</span>
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
          Thousands of golfers are already competing, winning, and giving back every month.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <FeaturePill icon={Trophy} text="Monthly Draws"  color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
          <FeaturePill icon={Heart}  text="Charity Giving" color="text-red-400 bg-red-500/10 border-red-500/20" />
          <FeaturePill icon={Target} text="Score Tracking" color="text-green-400 bg-green-500/10 border-green-500/20" />
          <FeaturePill icon={Zap}    text="Instant Results" color="text-blue-400 bg-blue-500/10 border-blue-500/20" />
        </div>

        <div className="space-y-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest">Prize structure</p>
          {[
            { match: '5 Numbers', prize: '40% pool', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { match: '4 Numbers', prize: '35% pool', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { match: '3 Numbers', prize: '25% pool', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
          ].map(({ match, prize, color, bg }) => (
            <div key={match} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${bg}`}>
              <span className="text-sm text-gray-400">{match}</span>
              <span className={`text-sm font-semibold ${color}`}>{prize}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-4">
          <div className="flex -space-x-2">
            {['A', 'J', 'M', 'R', 'T'].map((initial, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-[#060810] flex items-center justify-center text-xs font-semibold text-green-400">
                {initial}
              </div>
            ))}
          </div>
          <div>
            <p className="text-white text-sm font-medium">2,400+ golfers</p>
            <p className="text-gray-600 text-xs">joined this month</p>
          </div>
        </div>
      </div>
    </div>
  )
}