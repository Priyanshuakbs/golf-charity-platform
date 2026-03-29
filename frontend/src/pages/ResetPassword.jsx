import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../utils/api'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { token }   = useParams()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6)       return toast.error('Min. 6 characters required')
    setLoading(true)
    try {
      await resetPassword(token, form.password)
      toast.success('Password reset! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Reset failed or link expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center px-4" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: '#f0f0f0' }}>Reset Password</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>Enter your new password below</p>
        </div>
        <form
          onSubmit={submit}
          style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              New Password
            </label>
            <input
              type="password" required minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Confirm Password
            </label>
            <input
              type="password" required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{ background: '#4ade80', color: '#080808', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </main>
  )
}