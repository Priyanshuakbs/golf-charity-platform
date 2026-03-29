import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../utils/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center px-4" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: '#f0f0f0' }}>Forgot Password</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>We'll send a reset link to your email</p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📧</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#f0f0f0', marginBottom: 8 }}>Check your inbox</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 24 }}>
              Reset link sent to <strong style={{ color: '#f0f0f0' }}>{email}</strong>
            </p>
            <Link
              to="/login"
              style={{ display: 'block', background: '#4ade80', color: '#080808', borderRadius: 12, padding: '12px 24px', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email Address
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ background: '#4ade80', color: '#080808', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,.4)' }}>
              Remember it?{' '}
              <Link to="/login" style={{ color: '#4ade80', textDecoration: 'none' }}>Login</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  )
}