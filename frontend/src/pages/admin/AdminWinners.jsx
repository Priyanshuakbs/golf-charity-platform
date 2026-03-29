import { useEffect, useState } from 'react';
import { adminGetWinners, adminVerifyWinner, adminMarkPaid } from '../../utils/api';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const TAB_FILTERS = ['all', 'unverified', 'submitted', 'approved', 'rejected', 'unpaid', 'paid'];

export default function AdminWinners() {
  const [winners, setWinners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [acting, setActing]     = useState(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.filter = tab;
      const r = await adminGetWinners(params);
      setWinners(r.data.winners ?? r.data ?? []);
    } catch { toast.error('Failed to load winners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWinners(); }, [tab]);

  const handleVerify = async (id) => {
    setActing(id + '_verify');
    try {
      await adminVerifyWinner(id);
      toast.success('Winner approved!');
      fetchWinners();
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  const handlePaid = async (id) => {
    setActing(id + '_paid');
    try {
      await adminMarkPaid(id);
      toast.success('Marked as paid!');
      fetchWinners();
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  const verifyColor = (s) => {
    if (s === 'approved') return 'text-accent border-accent/30 bg-accent/10';
    if (s === 'rejected') return 'text-red-400 border-red-400/30 bg-red-400/10';
    if (s === 'submitted') return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
    return 'text-gray-400 border-gray-700 bg-white/5';
  };

  const payColor = (s) =>
    s === 'paid' ? 'text-accent border-accent/30 bg-accent/10' : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Admin</p>
        <h1 className="text-3xl font-display font-bold">Winners</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {TAB_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
              tab === t ? 'bg-accent text-dark border-accent' : 'border-dark-border text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-dark-card rounded-xl animate-pulse" />)}
        </div>
      ) : winners.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No winners found for this filter.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-white/3 text-gray-400 text-xs uppercase tracking-widest">
                <th className="text-left px-5 py-4">User</th>
                <th className="text-left px-5 py-4">Draw</th>
                <th className="text-left px-5 py-4">Match</th>
                <th className="text-left px-5 py-4">Prize</th>
                <th className="text-left px-5 py-4">Verification</th>
                <th className="text-left px-5 py-4">Payment</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => (
                <tr key={w._id} className="border-b border-dark-border hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium">{w.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{w.userId?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    {w.drawId ? `${MONTHS[(w.drawId.month ?? 1) - 1]} ${w.drawId.year}` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-accent/30 text-accent bg-accent/10 capitalize">
                      {w.matchType}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-accent">£{w.prizeAmount?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${verifyColor(w.verificationStatus)}`}>
                      {w.verificationStatus}
                    </span>
                    {w.proofUrl && (
                      <a href={w.proofUrl} target="_blank" rel="noreferrer" className="block text-xs text-blue-400 hover:underline mt-1">View proof ↗</a>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${payColor(w.paymentStatus)}`}>
                      {w.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5 items-end">
                      {w.verificationStatus === 'submitted' && (
                        <button
                          onClick={() => handleVerify(w._id)}
                          disabled={acting === w._id + '_verify'}
                          className="text-xs px-3 py-1 rounded-lg bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors whitespace-nowrap"
                        >
                          {acting === w._id + '_verify' ? '…' : '✓ Approve'}
                        </button>
                      )}
                      {w.verificationStatus === 'approved' && w.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handlePaid(w._id)}
                          disabled={acting === w._id + '_paid'}
                          className="text-xs px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors whitespace-nowrap"
                        >
                          {acting === w._id + '_paid' ? '…' : '💷 Mark Paid'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
