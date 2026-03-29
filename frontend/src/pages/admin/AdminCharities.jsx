import { useEffect, useState } from 'react';
import { adminGetCharities, adminCreateCharity, adminUpdateCharity, adminDeleteCharity } from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['health', 'education', 'environment', 'sports', 'community', 'other'];

const empty = { name: '', description: '', shortDescription: '', category: 'health', website: '', logo: '', isFeatured: false };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(empty);
  const [saving, setSaving]       = useState(false);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      const r = await adminGetCharities();
      // FIX: backend returns { success, data: [...] } — array is at r.data.data
      setCharities(r.data.data ?? []);
    } catch { toast.error('Failed to load charities'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCharities(); }, []);

  const openCreate = () => { setForm(empty); setEditingId(null); setShowForm(true); };
  const openEdit   = (c) => { setForm({ name: c.name, description: c.description, shortDescription: c.shortDescription || '', category: c.category, website: c.website || '', logo: c.logo || '', isFeatured: c.isFeatured }); setEditingId(c._id); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await adminUpdateCharity(editingId, form);
        toast.success('Charity updated');
      } else {
        await adminCreateCharity(form);
        toast.success('Charity created');
      }
      closeForm();
      fetchCharities();
    } catch (err) { toast.error(err.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await adminDeleteCharity(id);
      toast.success('Deleted');
      fetchCharities();
    } catch { toast.error('Delete failed'); }
  };

  const f = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }) });

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-display font-bold">Charities</h1>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2 px-5">+ Add Charity</button>
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg">{editingId ? 'Edit Charity' : 'New Charity'}</h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                <input required className="input-field" placeholder="Charity name" {...f('name')} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Short Description</label>
                <input className="input-field" placeholder="One-line summary" {...f('shortDescription')} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Description *</label>
                <textarea required rows={3} className="input-field resize-none" placeholder="Full description…" {...f('description')} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category *</label>
                <select required className="input-field" {...f('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Website URL</label>
                <input type="url" className="input-field" placeholder="https://…" {...f('website')} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Logo URL</label>
                <input type="url" className="input-field" placeholder="https://…" {...f('logo')} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-accent" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                <span className="text-sm text-gray-300">Featured charity</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={closeForm} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-dark-card rounded-2xl animate-pulse" />)}
        </div>
      ) : charities.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No charities yet. Add one above.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((c) => (
            <div key={c._id} className="card flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-accent">
                    {c.logo ? <img src={c.logo} alt={c.name} className="w-full h-full object-cover" /> : c.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <span className="text-xs text-gray-500 capitalize">{c.category}</span>
                  </div>
                  {c.isFeatured && <span className="ml-auto text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">⭐</span>}
                </div>
                <p className="text-gray-400 text-xs line-clamp-2">{c.shortDescription || c.description}</p>
                <p className="text-xs text-gray-600 mt-2">{c.subscriberCount ?? 0} supporters</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(c)} className="btn-outline text-xs py-1.5 flex-1">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-xs py-1.5 px-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}