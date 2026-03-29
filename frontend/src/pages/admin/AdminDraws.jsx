import { useEffect, useState } from 'react';
import { adminGetDraws, adminSimulateDraw, adminRunDraw, adminPublishDraw } from '../../utils/api';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDraws() {
  const [draws, setDraws]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [acting, setActing]     = useState(false);

  const fetchDraws = async () => {
    setLoading(true);
    try {
      const r = await adminGetDraws();
      // FIX: backend returns { success, data: [...] } — not { draws: [...] }
      const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      setDraws(list);
      if (list.length && !selected) setSelected(list[0]);
    } catch {
      toast.error('Failed to load draws');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDraws(); }, []);

  const act = async (fn, successMsg) => {
    setActing(true);
    try {
      await fn();
      toast.success(successMsg);
      fetchDraws();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-display font-bold">Draws</h1>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => act(adminSimulateDraw, 'Draw simulated!')}
            disabled={acting}
            className="btn-outline text-sm py-2 px-4"
          >
            🔮 Simulate Draw
          </button>
          <button
            onClick={() => { if (window.confirm('Run actual draw now?')) act(adminRunDraw, 'Draw completed!'); }}
            disabled={acting}
            className="btn-primary text-sm py-2 px-4"
          >
            🎯 Run Draw
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-dark-card rounded-2xl animate-pulse" />
      ) : draws.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          No draws yet. Click "Run Draw" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Draw list */}
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Draw History</p>
            {draws.map((d) => (
              <button
                key={d._id}
                onClick={() => setSelected(d)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selected?._id === d._id
                    ? 'border-accent bg-accent/5'
                    : 'border-dark-border hover:border-gray-600'
                }`}
              >
                <p className="font-display font-semibold">
                  {MONTHS[(d.month ?? 1) - 1]} {d.year}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                    d.status === 'published' ? 'text-accent border-accent/30 bg-accent/10' :
                    d.status === 'completed' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                    'text-gray-400 border-gray-700'
                  }`}>{d.status}</span>
                  <span className="text-xs text-gray-500">
                    {(d.prizes?.fiveMatch?.winners?.length || 0) +
                     (d.prizes?.fourMatch?.winners?.length || 0) +
                     (d.prizes?.threeMatch?.winners?.length || 0)} winners
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Draw detail */}
          {selected && (
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold">
                      {MONTHS[(selected.month ?? 1) - 1]} {selected.year}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 capitalize">
                      {selected.mode ?? selected.drawType} · {selected.activeSubscribers ?? 0} participants
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full border capitalize ${
                      selected.status === 'published' ? 'text-accent border-accent/30' :
                      selected.status === 'completed' ? 'text-blue-400 border-blue-400/30' :
                      'text-gray-400 border-gray-700'
                    }`}>{selected.status}</span>
                    {selected.status !== 'published' && (
                      <button
                        onClick={() => act(() => adminPublishDraw(selected._id), 'Draw published!')}
                        disabled={acting}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Winning Numbers</p>
                <div className="flex gap-3 flex-wrap">
                  {selected.winningNumbers?.length
                    ? selected.winningNumbers.map((n) => (
                        <div key={n} className="draw-ball">{n}</div>
                      ))
                    : <p className="text-gray-600 text-sm">Not drawn yet</p>
                  }
                </div>
              </div>

              {/* Prize pools */}
              <div className="card">
                <h3 className="font-display font-semibold mb-4">Prize Pools</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: '5 Match (Jackpot)', val: selected.prizes?.fiveMatch?.pool,   color: 'text-gold' },
                    { label: '4 Match',           val: selected.prizes?.fourMatch?.pool,   color: 'text-accent' },
                    { label: '3 Match',           val: selected.prizes?.threeMatch?.pool,  color: 'text-blue-400' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-center p-4 bg-white/5 rounded-xl">
                      <p className={`text-xl font-display font-bold ${color}`}>
                        £{((val ?? 0) / 100).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Winners */}
              {['fiveMatch', 'fourMatch', 'threeMatch'].some(
                (t) => selected.prizes?.[t]?.winners?.length > 0
              ) && (
                <div className="card">
                  <h3 className="font-display font-semibold mb-4">Winners</h3>
                  <div className="space-y-3">
                    {['fiveMatch', 'fourMatch', 'threeMatch'].flatMap((tier) =>
                      (selected.prizes?.[tier]?.winners ?? []).map((w, i) => (
                        <div key={`${tier}-${i}`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div>
                            <p className="text-sm font-medium">{w.userId?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              {w.userId?.email} · <span className="capitalize">{tier}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent font-bold">
                              £{((selected.prizes[tier].perWinner ?? 0) / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{w.paymentStatus ?? 'unpaid'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}