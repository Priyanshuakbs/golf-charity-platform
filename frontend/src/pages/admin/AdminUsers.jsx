import { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUser, adminDeleteUser } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    try {
      const r = await adminGetUsers(params);
      // FIX: backend returns { users: [...] }
      setUsers(r.data.users ?? r.data ?? []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const saveEdit = async (id) => {
    try {
      await adminUpdateUser(id, editForm);
      toast.success('User updated');
      setEditingId(null);
      fetchUsers();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminDeleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Delete failed'); }
  };

  // FIX: User model uses isSubscribed (Boolean) + subscriptionEnd (Date)
  //      NOT subscription.status object
  const getSubStatus = (u) => {
    if (!u.isSubscribed) return { label: 'inactive', color: 'text-red-400' };
    if (u.subscriptionEnd && new Date() > new Date(u.subscriptionEnd))
      return { label: 'expired', color: 'text-yellow-400' };
    return { label: 'active', color: 'text-accent' };
  };

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-1">Admin</p>
          <h1 className="text-3xl font-display font-bold">Users</h1>
        </div>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-card rounded-xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-white/3 text-gray-400 text-xs uppercase tracking-widest">
                <th className="text-left px-5 py-4">Name</th>
                <th className="text-left px-5 py-4">Email</th>
                <th className="text-left px-5 py-4">Role</th>
                <th className="text-left px-5 py-4">Subscription</th>
                <th className="text-left px-5 py-4">Winnings</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const sub = getSubStatus(u);
                return (
                  <tr key={u._id} className="border-b border-dark-border hover:bg-white/3 transition-colors">
                    {editingId === u._id ? (
                      <>
                        <td className="px-5 py-3">
                          <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="input-field py-1 text-sm" />
                        </td>
                        <td className="px-5 py-3">
                          <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="input-field py-1 text-sm" />
                        </td>
                        <td className="px-5 py-3">
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="input-field py-1 text-sm">
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td colSpan={2} />
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => saveEdit(u._id)} className="text-accent text-xs mr-3 hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs hover:underline">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 font-medium">{u.name}</td>
                        <td className="px-5 py-3 text-gray-400">{u.email}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                            u.role === 'admin'
                              ? 'border-accent/30 text-accent bg-accent/10'
                              : 'border-gray-700 text-gray-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {/* FIX: Now uses isSubscribed + subscriptionEnd */}
                          <span className={`text-xs font-medium capitalize ${sub.color}`}>
                            {sub.label}
                          </span>
                          {u.subscriptionPlan && (
                            <span className="text-gray-600 text-xs ml-1">({u.subscriptionPlan})</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-accent font-bold">
                          £{(u.totalWinnings ?? 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3 text-right space-x-3">
                          <button onClick={() => startEdit(u)} className="text-xs text-gray-400 hover:text-white transition-colors">Edit</button>
                          <button onClick={() => handleDelete(u._id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}