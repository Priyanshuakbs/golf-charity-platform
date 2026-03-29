import { useEffect, useState } from 'react'
import { getMyWins, submitProof } from '../utils/api'
import toast from 'react-hot-toast'

export default function MyWins() {
  const [wins, setWins]       = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)

  const fetchWins = async () => {
    try {
      const res  = await getMyWins()
      const raw  = res?.data ?? res
      const list = raw?.wins ?? raw?.data ?? raw
      setWins(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load wins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWins() }, [])

  const handleProofUpload = async (drawId, file) => {
    setUploading(drawId)
    const fd = new FormData()
    fd.append('proof', file)
    try {
      await submitProof(drawId, fd)
      toast.success('Proof submitted! Admin will review shortly.')
      await fetchWins()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  const matchColor = (type) => {
    if (type === '5-match') return '#fbbf24'
    if (type === '4-match') return '#4ade80'
    return '#60a5fa'
  }

  const verifyStyle = (status) => {
    if (status === 'approved') return { background: 'rgba(74,222,128,.1)',  border: '1px solid rgba(74,222,128,.2)',  color: '#4ade80' }
    if (status === 'rejected') return { background: 'rgba(239,68,68,.1)',   border: '1px solid rgba(239,68,68,.2)',   color: '#f87171' }
    if (status === 'submitted') return { background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.2)', color: '#60a5fa' }
    return { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)' }
  }

  const card = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 24 }

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>
            My Winnings
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Your draw wins and prize claims.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} style={{ height: 120, background: 'rgba(255,255,255,.04)', borderRadius: 16 }} />)}
          </div>
        ) : wins.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '64px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🏆</p>
            <p style={{ color: 'rgba(255,255,255,.4)' }}>No wins yet — keep entering your scores!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {wins.map(({ draw, winnerEntry }) => (
              <div key={draw._id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: '#f0f0f0', marginBottom: 4 }}>
                      {new Date(0, draw.month - 1).toLocaleString('default', { month: 'long' })} {draw.year} Draw
                    </h3>
                    <p style={{ fontSize: 13, fontWeight: 700, color: matchColor(winnerEntry.matchType), textTransform: 'capitalize' }}>
                      {winnerEntry.matchType} winner
                    </p>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 900, color: '#4ade80', fontFamily: "'Playfair Display',serif" }}>
                    £{winnerEntry.prizeAmount?.toFixed(2)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: winnerEntry.verificationStatus === 'unverified' ? 16 : 0 }}>
                  <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, background: winnerEntry.paymentStatus === 'paid' ? 'rgba(74,222,128,.1)' : 'rgba(251,191,36,.1)', border: winnerEntry.paymentStatus === 'paid' ? '1px solid rgba(74,222,128,.2)' : '1px solid rgba(251,191,36,.2)', color: winnerEntry.paymentStatus === 'paid' ? '#4ade80' : '#fbbf24' }}>
                    Payment: {winnerEntry.paymentStatus}
                  </span>
                  <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 100, ...verifyStyle(winnerEntry.verificationStatus) }}>
                    Verification: {winnerEntry.verificationStatus}
                  </span>
                </div>

                {winnerEntry.verificationStatus === 'unverified' && (
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Upload a screenshot of your scores as proof:</p>
                    <label style={{ display: 'inline-block', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#f0f0f0' }}>
                      {uploading === draw._id ? 'Uploading...' : '📎 Upload Proof'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading === draw._id}
                        onChange={(e) => e.target.files[0] && handleProofUpload(draw._id, e.target.files[0])} />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}