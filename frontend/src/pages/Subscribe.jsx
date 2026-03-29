import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createCheckout } from '../utils/api'
import toast from 'react-hot-toast'

export default function Subscribe() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [plan, setPlan]       = useState('monthly')
  const [loading, setLoading] = useState(false)

  const plans = {
    monthly: { label: 'Monthly', price: '£9.99', period: '/month', save: null },
    yearly:  { label: 'Yearly',  price: '£99',   period: '/year',  save: 'Save £20' },
  }

  const stripeNotConfigured =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'pk_test_your_stripe_key_here' ||
    !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

  const handleSubscribe = async () => {
    if (!user) { navigate('/register'); return }
    setLoading(true)
    try {
      const res = await createCheckout(plan)
      const url = res?.data?.url ?? res?.data?.data?.url ?? res?.url
      if (url) {
        window.location.href = url
      } else {
        toast.error('Stripe not configured. Use Skip button for testing.')
        setLoading(false)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen pt-24 px-4 max-w-4xl mx-auto pb-20">
      <div className="text-center mb-12">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">Join the platform</p>
        <h1 className="text-4xl font-display font-bold mb-4">Choose your plan</h1>
        <p className="text-gray-400">Every subscription enters you into monthly draws and supports your chosen charity.</p>
      </div>

      {/* Plan Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {Object.entries(plans).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPlan(key)}
            className={`card text-left transition-all duration-200 border-2 ${
              plan === key ? 'border-accent glow-accent' : 'border-dark-border hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-display font-semibold text-lg">{p.label}</p>
                {p.save && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{p.save}</span>}
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${plan === key ? 'border-accent bg-accent' : 'border-gray-600'}`}>
                {plan === key && <div className="w-2 h-2 rounded-full bg-dark" />}
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-white">
              {p.price}<span className="text-base font-body text-gray-500 font-normal">{p.period}</span>
            </p>
          </button>
        ))}
      </div>

      {/* What's included */}
      <div className="card mb-8">
        <h3 className="font-display font-semibold mb-4">What's included</h3>
        <ul className="space-y-3">
          {[
            'Enter monthly prize draws with your Stableford scores',
            'Win up to 40% of the prize pool (jackpot)',
            'Donate 10%+ of your subscription to a charity you choose',
            'Track your golf scores with rolling 5-score history',
            'Access full draw results and winner leaderboards',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
              <span className="text-gray-300 text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stripe warning */}
      {stripeNotConfigured && (
        <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
          <p style={{ color: '#fbbf24', fontSize: 13, lineHeight: 1.6 }}>
            ⚠️ <strong>Stripe not configured yet.</strong> Add real Stripe keys in <code style={{ background: 'rgba(0,0,0,.3)', padding: '1px 6px', borderRadius: 4 }}>.env</code> files to enable payments.
            Use the skip button below to test the app.
          </p>
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="btn-primary w-full py-5 text-base"
      >
        {loading ? 'Redirecting to checkout...' : `Subscribe ${plans[plan].label} — ${plans[plan].price}`}
      </button>

      {/* Skip button for testing */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{ display: 'block', width: '100%', marginTop: 12, background: 'transparent', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '13px', color: 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: 13, transition: 'all .2s' }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,.7)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.35)'}
      >
        Skip for now → Go to Dashboard
      </button>

      <p className="text-center text-xs text-gray-600 mt-4">
        Secure payment via Stripe. Cancel anytime from your dashboard.{' '}
        {!user && <Link to="/login" className="text-accent">Already have an account?</Link>}
      </p>
    </main>
  )
}