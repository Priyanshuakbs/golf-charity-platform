import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, uploadAvatar } from '../services/api'
import toast from 'react-hot-toast'

const card = { background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: 24 }
const inputStyle = { width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, outline: 'none', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }

// ✅ FIX: avatar ka pura URL banao
const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (avatar.startsWith('http')) return avatar  // already full URL hai
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${base}/${avatar}`
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [pwForm, setPwForm]           = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingProfile, setSavingProfile]   = useState(false)
  const [savingPw, setSavingPw]             = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile(profileForm)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePwSave = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Change failed')
    } finally {
      setSavingPw(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      await uploadAvatar(fd)
      await refreshUser()
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const btnPrimary = (loading) => ({
    background: '#4ade80', color: '#080808', border: 'none', borderRadius: 12,
    padding: '12px 24px', fontWeight: 700, fontSize: 14,
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
  })

  // ✅ FIX: pura URL bana lo ek baar
  const avatarUrl = getAvatarUrl(user?.avatar)

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: '#080808' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#f0f0f0', fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>
            Profile Settings
          </h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>Manage your account details</p>
        </div>

        {/* Avatar */}
        <div style={{ ...card, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: '#f0f0f0', marginBottom: 18 }}>Profile Picture</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,.15)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#4ade80', overflow: 'hidden', flexShrink: 0 }}>
              {/* ✅ FIX: avatarUrl use karo, user.avatar nahi */}
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <label style={{ display: 'inline-block', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#f0f0f0' }}>
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 6 }}>Max 5MB. JPG or PNG.</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <form onSubmit={handleProfileSave} style={{ ...card, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: '#f0f0f0' }}>Personal Information</h2>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" required value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              style={inputStyle} />
          </div>
          <button type="submit" disabled={savingProfile} style={btnPrimary(savingProfile)}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePwSave} style={{ ...card, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: '#f0f0f0' }}>Change Password</h2>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" required value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" required minLength={6} value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              placeholder="Min. 6 characters" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" required value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="••••••••" style={inputStyle} />
          </div>
          <button type="submit" disabled={savingPw} style={btnPrimary(savingPw)}>
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>

        {/* Account Info */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, color: '#f0f0f0', marginBottom: 16 }}>Account Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Role', value: user?.role, color: '#f0f0f0' },
              { label: 'Subscription', value: user?.isSubscribed ? 'active' : 'inactive', color: user?.isSubscribed ? '#4ade80' : '#f87171' },
              { label: 'Plan', value: user?.subscriptionPlan || '—', color: '#f0f0f0' },
              { label: 'Total Winnings', value: `£${user?.totalWinnings?.toFixed(2) || '0.00'}`, color: '#4ade80' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', paddingBottom: 12 }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color, textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}