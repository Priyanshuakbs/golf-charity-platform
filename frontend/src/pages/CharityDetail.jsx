// CharityDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCharityBySlug, updateCharity } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function CharityDetail() {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [pct, setPct] = useState(10);

  useEffect(() => {
    getCharityBySlug(slug)
      .then((r) => setCharity(r.data.charity))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelect = async () => {
    if (!user) return toast.error('Login to select a charity');
    setSelecting(true);
    try {
      await updateCharity({ charityId: charity._id, charityPercentage: pct });
      await refreshUser();
      toast.success(`Now supporting ${charity.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select charity');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" /></div>;
  if (!charity) return <div className="min-h-screen pt-24 text-center text-gray-400 pt-32">Charity not found</div>;

  const isSelected = user?.charityId === charity._id.toString();

  return (
    <main className="pt-24 pb-20 max-w-4xl mx-auto px-4">
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 overflow-hidden flex-shrink-0">
            {charity.logo
              ? <img src={charity.logo} alt={charity.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-accent font-bold text-3xl">{charity.name[0]}</div>}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold mb-1">{charity.name}</h1>
                <span className="text-xs bg-primary/20 text-primary-light px-3 py-1 rounded-full capitalize">{charity.category}</span>
              </div>
              {charity.isFeatured && <span className="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full">⭐ Featured</span>}
            </div>
            {charity.website && (
              <a href={charity.website} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-accent mt-2 block">
                {charity.website} ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-display font-semibold mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed">{charity.description}</p>
          </div>

          {charity.events?.length > 0 && (
            <div className="card">
              <h2 className="font-display font-semibold mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                {charity.events.map((ev, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl">
                    <p className="font-medium">{ev.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(ev.date).toLocaleDateString()} · {ev.location}</p>
                    {ev.description && <p className="text-sm text-gray-400 mt-2">{ev.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card sticky top-24">
            <h2 className="font-display font-semibold mb-4">Support This Charity</h2>
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Donation % of subscription</label>
              <input
                type="number" min="10" max="100" value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="input-field"
              />
              <p className="text-xs text-gray-600 mt-1">Minimum 10%</p>
            </div>
            <button
              onClick={handleSelect}
              disabled={selecting || isSelected}
              className="btn-primary w-full"
            >
              {isSelected ? '✓ Currently Supporting' : selecting ? 'Saving...' : 'Support This Charity'}
            </button>
            <p className="text-xs text-gray-600 mt-3 text-center">{charity.subscriberCount} supporters</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CharityDetail;
