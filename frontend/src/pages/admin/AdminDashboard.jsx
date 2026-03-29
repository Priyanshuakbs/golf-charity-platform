import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetReports } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetReports()
      .then((r) => setStats(r.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users',        value: stats.totalUsers        ?? '—', icon: '👥', to: '/admin/users' },
        { label: 'Active Subscribers', value: stats.activeSubscribers ?? '—', icon: '✅', to: '/admin/users' },
        { label: 'Total Draws',        value: stats.totalDraws        ?? '—', icon: '🎯', to: '/admin/draws' },
        { label: 'Pending Winners',    value: stats.pendingWinners    ?? '—', icon: '🏆', to: '/admin/winners' },
        { label: 'Total Revenue',      value: `£${(stats.totalRevenue ?? 0).toFixed(2)}`, icon: '💷', to: null },
        { label: 'Total Charities',    value: stats.totalCharities    ?? '—', icon: '🏥', to: '/admin/charities' },
      ]
    : [];

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-2">Admin Panel</p>
        <h1 className="text-4xl font-display font-bold">Dashboard</h1>
      </div>

      {/* Nav Links */}
      <div className="flex flex-wrap gap-3 mb-10">
        {[
          { label: '👥 Users',     to: '/admin/users' },
          { label: '🎯 Draws',     to: '/admin/draws' },
          { label: '🏥 Charities', to: '/admin/charities' },
          { label: '🏆 Winners',   to: '/admin/winners' },
        ].map(({ label, to }) => (
          <Link key={to} to={to} className="btn-outline text-sm py-2 px-5">{label}</Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-dark-card rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon, to }) => {
            const inner = (
              <div className="card h-full hover:border-accent/40 border border-dark-border transition-colors">
                <p className="text-2xl mb-2">{icon}</p>
                <p className="text-3xl font-display font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            );
            return to
              ? <Link key={label} to={to}>{inner}</Link>
              : <div key={label}>{inner}</div>;
          })}
        </div>
      )}
    </main>
  );
}