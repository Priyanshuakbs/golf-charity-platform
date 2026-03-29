import { useEffect, useState } from 'react'
import { getScores, addScore, editScore, deleteScore } from '../utils/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const card = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 24 }

export default function ScoreEntry() {
  const [scores, setScores]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState({ value: '', date: format(new Date(), 'yyyy-MM-dd') })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchScores() }, [])

  const fetchScores = async () => {
    try {
      const res  = await getScores()
      const raw  = res?.data ?? res
      const list = raw?.scores ?? raw?.data ?? raw
      setScores(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load scores')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res  = await addScore({ value: Number(form.value), date: form.date })
      const raw  = res?.data ?? res
      const list = raw?.scores ?? raw?.data ?? raw
      setScores(Array.isArray(list) ? list : [])
      setForm({ value: '', date: format(new Date(), 'yyyy-MM-dd') })
      toast.success('Score added!')
    } catch (err) {
      toast.error(err.message || 'Failed to add score')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (score) => {
    setEditingId(score._id)
    setEditForm({ value: score.value, date: format(new Date(score.date), 'yyyy-MM-dd') })
  }

  const handleEdit = async (id) => {
    try {
      const res  = await editScore(id, { value: Number(editForm.value), date: editForm.date })
      const raw  = res?.data ?? res
      const list = raw?.scores ?? raw?.data ?? raw
      setScores(Array.isArray(list) ? list : [])
      setEditingId(null)
      toast.success('Score updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return
    try {
      const res  = await deleteScore(id)
      const raw  = res?.data ?? res
      const list = raw?.scores ?? raw?.data ?? raw
      setScores(Array.isArray(list) ? list : [])
      toast.success('Score removed')
    } catch {
      toast.error('Failed to delete score')
    }
  }

  const getScoreColor = (val) => {
    if (val >= 36) return '#fbbf24'
    if (val >= 28) return '#4ade80'
    if (val >= 20) return '#60a5fa'
    return 'rgba(255,255,255,.4)'
  }

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>
            My Scores
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
            Track your last 5 Stableford scores. Adding a 6th replaces the oldest.
          </p>
        </div>

        {/* Add Score */}
        <div style={{ ...card, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, color: '#f0f0f0', marginBottom: 18 }}>
            Add New Score
          </h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Score (1–45)
              </label>
              <input type="number" min="1" max="45" required value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="e.g. 32" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Round Date
              </label>
              <input type="date" required value={form.date}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={inputStyle} />
            </div>
            <button type="submit" disabled={submitting}
              style={{ background: '#4ade80', color: '#080808', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, whiteSpace: 'nowrap' }}>
              {submitting ? 'Adding...' : '+ Add Score'}
            </button>
          </form>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 12 }}>{scores.length}/5 scores stored</p>
        </div>

        {/* Score List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 72, background: 'rgba(255,255,255,.04)', borderRadius: 14 }} />)}
          </div>
        ) : scores.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>⛳</p>
            <p style={{ color: 'rgba(255,255,255,.4)' }}>No scores yet. Add your first round above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.map((s, i) => (
              <div key={s._id} style={{ padding: '16px 20px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16 }}>
                {editingId === s._id ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <input type="number" min="1" max="45" value={editForm.value}
                        onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                        style={inputStyle} />
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <input type="date" value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        style={inputStyle} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(s._id)}
                        style={{ background: '#4ade80', color: '#080808', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)}
                        style={{ background: 'rgba(255,255,255,.06)', color: '#f0f0f0', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 13 }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', fontFamily: 'monospace', width: 16 }}>{i + 1}</span>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${getScoreColor(s.value)}`, background: `${getScoreColor(s.value)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: 17, color: getScoreColor(s.value) }}>
                        {s.value}
                      </div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{s.value} points</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{format(new Date(s.date), 'EEEE, dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {i === 0 && (
                        <span style={{ fontSize: 11, background: 'rgba(74,222,128,.1)', color: '#4ade80', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(74,222,128,.2)' }}>Latest</span>
                      )}
                      <button onClick={() => startEdit(s)}
                        style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#f0f0f0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(s._id)}
                        style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(74,222,128,.05)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
            <strong style={{ color: '#4ade80' }}>How draw matching works:</strong> Your 5 stored scores are your draw numbers. Match 3 = prize, 4 = major prize, all 5 = jackpot!
          </p>
        </div>
      </div>
    </main>
  )
}