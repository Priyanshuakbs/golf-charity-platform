import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCharities } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'health', 'education', 'environment', 'sports', 'community', 'other'];
const CATEGORY_ICONS = {
  All: '🏷️', health: '❤️', education: '📚', environment: '🌿',
  sports: '⛳', community: '🤝', other: '✨',
};
const CATEGORY_COLORS = {
  health: '#f87171', education: '#60a5fa', environment: '#4ade80',
  sports: '#34d399', community: '#fbbf24', other: '#a78bfa', All: '#4ade80',
};

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 20, padding: 24, minHeight: 220 }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,.06)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, background: 'rgba(255,255,255,.06)', borderRadius: 6, marginBottom: 8, width: '70%' }} />
          <div style={{ height: 11, background: 'rgba(255,255,255,.04)', borderRadius: 6, width: '40%' }} />
        </div>
      </div>
      <div style={{ height: 12, background: 'rgba(255,255,255,.04)', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 12, background: 'rgba(255,255,255,.04)', borderRadius: 6, width: '80%', marginBottom: 20 }} />
      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', marginBottom: 16 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ height: 11, background: 'rgba(255,255,255,.04)', borderRadius: 6, width: 80 }} />
        <div style={{ height: 11, background: 'rgba(255,255,255,.04)', borderRadius: 6, width: 60 }} />
      </div>
    </div>
  );
}

function CharityCard({ charity, onSelect, isSelected }) {
  const color = CATEGORY_COLORS[charity.category] || '#4ade80';
  const initial = charity.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      onClick={() => onSelect(charity)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: isSelected ? 'rgba(74,222,128,.05)' : 'rgba(255,255,255,.03)',
        border: `1px solid ${isSelected ? 'rgba(74,222,128,.4)' : 'rgba(255,255,255,.07)'}`,
        borderRadius: 20, padding: 24, cursor: 'pointer',
        transition: 'all .25s', position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)';
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.3)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {charity.isFeatured && (
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)', color: '#fbbf24', fontSize: 10, padding: '3px 9px', borderRadius: 100, fontWeight: 600, letterSpacing: '0.06em' }}>
          ⭐ Featured
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color, flexShrink: 0, overflow: 'hidden' }}>
          {charity.logo ? <img src={charity.logo} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: '#f0f0f0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{charity.name}</p>
          <span style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, background: `${color}15`, padding: '2px 8px', borderRadius: 100 }}>
            {CATEGORY_ICONS[charity.category]} {charity.category}
          </span>
        </div>
      </div>

      <p style={{ color: 'rgba(255,255,255,.42)', fontSize: 13, lineHeight: 1.75, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {charity.shortDescription || charity.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18, color }}>👥</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{charity.subscriberCount ?? 0} supporters</span>
        </div>
        {charity.totalReceived > 0 && (
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>£{(charity.totalReceived / 100).toFixed(0)} raised</span>
        )}
      </div>

      {isSelected && (
        <div style={{ marginTop: 14, padding: '10px 16px', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
          <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>Currently supporting</span>
        </div>
      )}
    </div>
  );
}

export default function Charities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    setLoading(true);
    getCharities(params)
      .then((r) => {
        const raw = r?.data ?? r;
        const list = raw?.data ?? raw;
        const arr = Array.isArray(list) ? list : [];
        setCharities(arr);
        if (!search && category === 'All') setFeatured(arr.filter(c => c.isFeatured));
      })
      .catch(() => setCharities([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  const userCharityId = user?.charityId?._id ?? user?.charityId;

  return (
    <main className="min-h-screen pt-28 pb-24" style={{ background: '#080808' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', borderRadius: 100, padding: '6px 18px', fontSize: 11, color: '#4ade80', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 18 }}>
            Make a difference
          </span>
          <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em', marginBottom: 14, lineHeight: 1.1 }}>
            Choose Your Charity
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            A minimum of 10% of your subscription goes directly to your chosen charity every month.
          </p>
        </div>

        {/* Featured strip (only shown when not filtering) */}
        {!search && category === 'All' && featured.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 16 }}>⭐ Featured Charities</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {featured.map(c => (
                <CharityCard key={c._id} charity={c} isSelected={userCharityId?.toString() === c._id?.toString()} onSelect={() => navigate(`/charities/${c.slug ?? c._id}`)} />
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '40px 0 32px' }} />
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
              <input
                type="text"
                placeholder="Search charities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: '12px 16px 12px 40px', color: '#f0f0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 16px', color: 'rgba(255,255,255,.5)', fontSize: 13, cursor: 'pointer' }}>
                Clear ✕
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '8px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all .2s', textTransform: 'capitalize', border: '1px solid',
                  background: category === c ? (CATEGORY_COLORS[c] || '#4ade80') : 'rgba(255,255,255,.04)',
                  color: category === c ? '#080808' : 'rgba(255,255,255,.5)',
                  borderColor: category === c ? (CATEGORY_COLORS[c] || '#4ade80') : 'rgba(255,255,255,.1)',
                }}
              >
                {CATEGORY_ICONS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', marginBottom: 18 }}>
            {charities.length} {charities.length === 1 ? 'charity' : 'charities'} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : charities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#f0f0f0', marginBottom: 10 }}>No charities found</h3>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 14, marginBottom: 24 }}>
              {search ? `No results for "${search}"` : 'No charities in this category yet.'}
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', padding: '10px 24px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Show All Charities
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {charities.map((c) => (
              <CharityCard
                key={c._id}
                charity={c}
                isSelected={userCharityId?.toString() === c._id?.toString()}
                onSelect={() => navigate(`/charities/${c.slug ?? c._id}`)}
              />
            ))}
          </div>
        )}

        {/* Info bar */}
        <div style={{ marginTop: 60, padding: '24px 28px', background: 'rgba(74,222,128,.04)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>💚</span>
            <div>
              <p style={{ fontWeight: 700, color: '#f0f0f0', fontSize: 15, marginBottom: 3 }}>Minimum 10% goes to charity</p>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>You can increase your contribution in your profile settings.</p>
            </div>
          </div>
          <Link to="/profile" style={{ background: 'rgba(74,222,128,.15)', border: '1px solid rgba(74,222,128,.3)', color: '#4ade80', padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Adjust in Profile →
          </Link>
        </div>

      </div>
    </main>
  );
}