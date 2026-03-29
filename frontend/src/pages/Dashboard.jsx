import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDashboard } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const card = {
  background: 'rgba(255,255,255,.03)',
  border: '1px solid rgba(255,255,255,.07)',
  borderRadius: 20,
  padding: 24,
};

function StatCard({ label, value, color, icon }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</p>
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display',serif", color, textTransform: 'capitalize' }}>{value}</p>
    </div>
  );
}

function ScoreRow({ score, index }) {
  const date = new Date(score.date);
  const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', fontFamily: 'monospace', width: 16 }}>{index + 1}</span>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(74,222,128,.4)', background: 'rgba(74,222,128,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: 16, color: '#4ade80', flexShrink: 0 }}>
          {score.value}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0' }}>{score.value} points</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{formatted}</p>
        </div>
      </div>
      {index === 0 && (
        <span style={{ fontSize: 11, background: 'rgba(74,222,128,.1)', color: '#4ade80', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(74,222,128,.2)', fontWeight: 600 }}>Latest</span>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <main style={{ minHeight: '100vh', background: '#080808', paddingTop: 112 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 44, background: 'rgba(255,255,255,.05)', borderRadius: 8, width: 220, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 88, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ height: 320, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 140, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />
            <div style={{ height: 140, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();

  useEffect(() => {
    if (params.get('payment') === 'success') toast.success('🎉 Subscription activated!');

    getDashboard()
      .then((r) => {
        const raw = r?.data ?? r;
        // getDashboard returns { success, data: { user, scores, latestDraw } }
        setData(raw?.data ?? raw);
      })
      .catch((err) => {
        console.error('Dashboard error:', err);
        toast.error('Failed to load dashboard');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  // Fallback to authUser if dashboard call returned nothing
  const user = data?.user ?? authUser;
  const scores = Array.isArray(data?.scores) ? data.scores : [];
  const latestDraw = data?.latestDraw ?? null;

  if (!user) return (
    <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ marginBottom: 16 }}>Could not load dashboard. Please log in again.</p>
        <Link to="/login" style={{ color: '#4ade80' }}>Go to Login →</Link>
      </div>
    </main>
  );

  // Subscription can come as { status, plan } or flat isSubscribed + subscriptionPlan
  const isSubscribed = user?.subscription?.status === 'active' || (user?.isSubscribed && user?.subscriptionEnd && new Date(user.subscriptionEnd) > new Date());
  const plan = user?.subscription?.plan ?? user?.subscriptionPlan ?? null;
  const firstName = user?.name?.split(' ')[0] ?? 'Golfer';

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>
            Hey, {firstName} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 15 }}>Here's your GolfDraw overview</p>
        </div>

        {/* Subscription Banner */}
        {!isSubscribed && (
          <div style={{ ...card, border: '1px solid rgba(74,222,128,.2)', background: 'rgba(74,222,128,.04)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#4ade80', fontSize: 16, marginBottom: 4 }}>🔒 Subscription Required</p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Subscribe to enter monthly draws and track your scores.</p>
            </div>
            <Link to="/subscribe" style={{ background: '#4ade80', color: '#080808', padding: '11px 26px', borderRadius: 100, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Subscribe Now →
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon="📋" label="Plan" value={isSubscribed ? (plan ?? 'Active') : 'Inactive'} color={isSubscribed ? '#4ade80' : 'rgba(255,255,255,.4)'} />
          <StatCard icon="🎯" label="Draws Entered" value={user?.drawsEntered ?? 0} color="#60a5fa" />
          <StatCard icon="💰" label="Total Winnings" value={`£${((user?.totalWinnings ?? 0) / 100).toFixed(2)}`} color="#fbbf24" />
          <StatCard icon="💚" label="Charity %" value={`${user?.charityPercentage ?? 10}%`} color="#a78bfa" />
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

          {/* Scores panel */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, color: '#f0f0f0' }}>My Scores</h2>
              <Link to="/scores" style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(74,222,128,.08)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(74,222,128,.2)' }}>
                Manage →
              </Link>
            </div>

            {scores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>⛳</div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>No scores yet</p>
                <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14, marginBottom: 20 }}>Add your Stableford scores to enter the monthly draw.</p>
                {isSubscribed ? (
                  <Link to="/scores" style={{ background: '#4ade80', color: '#080808', padding: '11px 26px', borderRadius: 100, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    Add First Score
                  </Link>
                ) : (
                  <Link to="/subscribe" style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', padding: '11px 26px', borderRadius: 100, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    Subscribe First
                  </Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {scores.map((s, i) => <ScoreRow key={s._id} score={s} index={i} />)}
                {scores.length === 5 && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textAlign: 'center', marginTop: 6 }}>
                    Showing last 5 scores · Oldest removed when new score is added
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Charity card */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#f0f0f0' }}>My Charity</h2>
                <Link to="/charities" style={{ fontSize: 12, color: '#4ade80', textDecoration: 'none' }}>Change →</Link>
              </div>
              {user?.charityId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4ade80', fontSize: 20, flexShrink: 0 }}>
                    {(user.charityId.name ?? '?')[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>{user.charityId.name ?? 'Charity'}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{user.charityPercentage ?? 10}% of subscription</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 14 }}>No charity selected yet.</p>
                  <Link to="/charities" style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', textDecoration: 'none', border: '1px solid rgba(74,222,128,.3)', padding: '8px 18px', borderRadius: 100, background: 'rgba(74,222,128,.06)' }}>
                    Choose Charity
                  </Link>
                </div>
              )}
            </div>

            {/* Latest draw card */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#f0f0f0' }}>Latest Draw</h2>
                <Link to="/draws" style={{ fontSize: 12, color: '#4ade80', textDecoration: 'none' }}>All draws →</Link>
              </div>
              {latestDraw ? (
                <>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 14 }}>
                    {MONTHS[(latestDraw.month ?? 1) - 1]} {latestDraw.year}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {latestDraw.winningNumbers?.map((n, i) => (
                      <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(74,222,128,.4)', background: 'rgba(74,222,128,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#4ade80' }}>
                        {n}
                      </div>
                    ))}
                  </div>
                  {latestDraw.jackpotRolledOver && (
                    <p style={{ fontSize: 12, color: '#fbbf24', marginTop: 12 }}>🔄 Jackpot rolled over!</p>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>🎯</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>No draws yet. The first draw runs end of month!</p>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div style={card}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#f0f0f0', marginBottom: 14 }}>Quick Links</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { to: '/scores',     icon: '⛳', label: 'Enter a score' },
                  { to: '/draws',      icon: '🎯', label: 'View draw results' },
                  { to: '/charities',  icon: '💚', label: 'Change charity' },
                  { to: '/profile',    icon: '👤', label: 'Edit profile' },
                  { to: '/wins',       icon: '🏆', label: 'My winnings' },
                ].map(({ to, icon, label }) => (
                  <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', textDecoration: 'none', color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 500, transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,.06)'; e.currentTarget.style.color = '#4ade80'; e.currentTarget.style.borderColor = 'rgba(74,222,128,.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'; }}
                  >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    {label}
                    <span style={{ marginLeft: 'auto', opacity: 0.4 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}