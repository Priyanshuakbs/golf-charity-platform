import { useEffect, useState } from 'react';
import { getDraws } from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TIER_CONFIG = {
  fiveMatch:  { label: '5 Match', sublabel: 'Jackpot', color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.25)', icon: '🏆' },
  fourMatch:  { label: '4 Match', sublabel: 'Tier 2',  color: '#4ade80', bg: 'rgba(74,222,128,.1)',  border: 'rgba(74,222,128,.25)',  icon: '🥈' },
  threeMatch: { label: '3 Match', sublabel: 'Tier 3',  color: '#60a5fa', bg: 'rgba(96,165,250,.1)',  border: 'rgba(96,165,250,.25)',  icon: '🥉' },
};

function Ball({ number, size = 52, fontSize = 16 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid rgba(74,222,128,.5)', background: 'rgba(74,222,128,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize, color: '#4ade80', flexShrink: 0 }}>
      {number}
    </div>
  );
}

function SkeletonDraw() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1,2,3].map(i => <div key={i} style={{ height: 72, background: 'rgba(255,255,255,.04)', borderRadius: 14 }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ height: 200, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />
        <div style={{ height: 140, background: 'rgba(255,255,255,.04)', borderRadius: 20 }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🎯</div>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#f0f0f0', marginBottom: 12 }}>No Draws Yet</h3>
      <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 15, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
        The first monthly draw hasn't happened yet. Keep entering your scores — the draw runs at the end of each month!
      </p>
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ padding: '16px 24px', background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#4ade80', fontFamily: "'Playfair Display',serif", marginBottom: 4 }}>5</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Numbers Drawn</p>
        </div>
        <div style={{ padding: '16px 24px', background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', fontFamily: "'Playfair Display',serif", marginBottom: 4 }}>40%</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Jackpot Pool</p>
        </div>
        <div style={{ padding: '16px 24px', background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.15)', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', fontFamily: "'Playfair Display',serif", marginBottom: 4 }}>Monthly</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Draw Frequency</p>
        </div>
      </div>
    </div>
  );
}

export default function DrawResults() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getDraws()
      .then((r) => {
        const raw = r?.data ?? r;
        const list = raw?.data ?? raw;
        const arr = Array.isArray(list) ? list : [];
        setDraws(arr);
        if (arr.length) setSelected(arr[0]);
      })
      .catch(() => setDraws([]))
      .finally(() => setLoading(false));
  }, []);

  // Flatten winners from prizes object
  const getWinners = (draw) => {
    if (!draw) return [];
    const all = [];
    Object.entries(TIER_CONFIG).forEach(([tier, cfg]) => {
      const tierData = draw.prizes?.[tier];
      if (tierData?.winners?.length) {
        tierData.winners.forEach(w => all.push({ ...w, tier, tierCfg: cfg, prizeAmount: tierData.perWinner }));
      }
    });
    return all;
  };

  const winners = getWinners(selected);

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span style={{ display: 'inline-block', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 100, padding: '6px 18px', fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
            Past draws
          </span>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display',serif", letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }}>
            Draw Results
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 15 }}>
            5 numbers drawn monthly from all active subscribers' Stableford scores.
          </p>
        </div>

        {/* How it works strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
          {Object.entries(TIER_CONFIG).map(([, cfg]) => (
            <div key={cfg.label} style={{ flex: '1 1 160px', padding: '14px 18px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{cfg.icon}</span>
              <div>
                <p style={{ fontWeight: 700, color: cfg.color, fontSize: 14 }}>{cfg.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{cfg.sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? <SkeletonDraw /> : draws.length === 0 ? <EmptyState /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Draw list sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'sticky', top: 100 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 6 }}>Draw History</p>
              {draws.map((d) => {
                const isActive = selected?._id === d._id;
                const drawWinners = getWinners(d);
                return (
                  <button
                    key={d._id}
                    onClick={() => setSelected(d)}
                    style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: 14, border: '1px solid', cursor: 'pointer', transition: 'all .2s', width: '100%',
                      background: isActive ? 'rgba(74,222,128,.07)' : 'rgba(255,255,255,.03)',
                      borderColor: isActive ? 'rgba(74,222,128,.4)' : 'rgba(255,255,255,.07)',
                    }}
                  >
                    <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#f0f0f0', fontSize: 15, marginBottom: 6 }}>
                      {MONTHS[d.month - 1]} {d.year}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '1px solid', textTransform: 'capitalize', fontWeight: 600,
                        background: d.status === 'published' ? 'rgba(74,222,128,.1)' : 'rgba(255,255,255,.05)',
                        color: d.status === 'published' ? '#4ade80' : 'rgba(255,255,255,.4)',
                        borderColor: d.status === 'published' ? 'rgba(74,222,128,.3)' : 'rgba(255,255,255,.1)',
                      }}>
                        {d.status}
                      </span>
                      {drawWinners.length > 0 && (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>🏆 {drawWinners.length}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Draw detail */}
            {selected && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Winning numbers card */}
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 28, color: '#f0f0f0', marginBottom: 6 }}>
                        {FULL_MONTHS[selected.month - 1]} {selected.year}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
                        {selected.mode ?? selected.drawType ?? 'Random'} draw · {selected.activeSubscribers ?? 0} participants
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(74,222,128,.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)', textTransform: 'capitalize' }}>
                        {selected.status}
                      </span>
                      {selected.jackpotRolledOver && (
                        <span style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: 'rgba(251,191,36,.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.3)' }}>
                          🔄 Jackpot Rolled Over
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 18 }}>Winning Numbers</p>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {selected.winningNumbers?.length
                      ? selected.winningNumbers.map((n, i) => <Ball key={i} number={n} />)
                      : <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 14 }}>Numbers not drawn yet</p>
                    }
                  </div>
                </div>

                {/* Prize pools */}
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 28 }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, color: '#f0f0f0', marginBottom: 20 }}>Prize Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
                      const tierData = selected.prizes?.[tier];
                      const pool = tierData?.pool ?? 0;
                      const winnerCount = tierData?.winners?.length ?? 0;
                      return (
                        <div key={tier} style={{ textAlign: 'center', padding: '22px 12px', background: cfg.bg, borderRadius: 16, border: `1px solid ${cfg.border}` }}>
                          <p style={{ fontSize: 26, marginBottom: 4 }}>{cfg.icon}</p>
                          <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display',serif", color: cfg.color, marginBottom: 4 }}>
                            £{(pool / 100).toFixed(2)}
                          </p>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>{cfg.label}</p>
                          <p style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                            {winnerCount === 0 ? 'No winners' : `${winnerCount} winner${winnerCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(255,255,255,.03)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Total Prize Pool</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#f0f0f0', fontFamily: "'Playfair Display',serif" }}>
                      £{((selected.prizePool ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Winners */}
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 28 }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, color: '#f0f0f0', marginBottom: 20 }}>
                    Winners {winners.length > 0 && <span style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontFamily: 'sans-serif', fontWeight: 400 }}>({winners.length})</span>}
                  </h3>
                  {winners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                      <p style={{ fontSize: 36, marginBottom: 12 }}>🎯</p>
                      <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 14 }}>No winners this draw.</p>
                      {selected.jackpotRolledOver && (
                        <p style={{ color: '#fbbf24', fontSize: 13, marginTop: 8 }}>Jackpot carries over to next month!</p>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {winners.map((w, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: `${w.tierCfg.bg}`, borderRadius: 14, border: `1px solid ${w.tierCfg.border}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${w.tierCfg.color}20`, border: `2px solid ${w.tierCfg.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: w.tierCfg.color, fontSize: 16 }}>
                              {(w.name ?? w.userId?.name ?? '?')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 3 }}>
                                {w.name ?? w.userId?.name ?? 'Anonymous'}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, color: w.tierCfg.color, fontWeight: 600, background: `${w.tierCfg.color}15`, padding: '2px 8px', borderRadius: 100 }}>
                                  {w.tierCfg.icon} {w.tierCfg.label}
                                </span>
                                {w.matchedScores?.length > 0 && (
                                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
                                    Matched: {w.matchedScores.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 22, fontWeight: 800, color: w.tierCfg.color, fontFamily: "'Playfair Display',serif" }}>
                              £{((w.prizeAmount ?? 0) / 100).toFixed(2)}
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 2, textTransform: 'capitalize' }}>
                              {w.paymentStatus ?? 'pending'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}