const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const getFormHeaders = () => {
  const headers = {}
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getHeaders(),
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.response = { data }
    throw err
  }
  return { data }
}

const requestForm = async (endpoint, formData, method = 'POST') => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: getFormHeaders(),
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.response = { data }
    throw err
  }
  return { data }
}

// ── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser      = (body)        => request('/auth/login',                   { method: 'POST', body: JSON.stringify(body) })
export const registerUser   = (body)        => request('/auth/register',                { method: 'POST', body: JSON.stringify(body) })
export const forgotPassword = (email)       => request('/auth/forgot-password',         { method: 'POST', body: JSON.stringify({ email }) })
export const resetPassword  = (token, pass) => request(`/auth/reset-password/${token}`, { method: 'PUT',  body: JSON.stringify({ password: pass }) })

// ── USER ──────────────────────────────────────────────────────────────────
export const getMe          = ()     => request('/users/me')
export const updateProfile  = (body) => request('/users/me',          { method: 'PUT', body: JSON.stringify(body) })
export const changePassword = (body) => request('/users/me/password', { method: 'PUT', body: JSON.stringify(body) })
export const uploadAvatar   = (fd)   => requestForm('/users/me/avatar', fd)
export const getMyWins      = ()     => request('/users/me/wins')
export const submitProof    = (drawId, fd) => requestForm(`/users/me/wins/${drawId}/proof`, fd)
export const updateCharity  = (body) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) })

// ── DASHBOARD ─────────────────────────────────────────────────────────────
export const getDashboard = () => request('/users/me/dashboard')
export const openPortal   = () => request('/payments/portal', { method: 'POST' })

// ── SCORES ────────────────────────────────────────────────────────────────
export const getScores   = ()         => request('/scores')
export const addScore    = (body)     => request('/scores',       { method: 'POST',   body: JSON.stringify(body) })
export const editScore   = (id, body) => request(`/scores/${id}`, { method: 'PUT',    body: JSON.stringify(body) })
export const deleteScore = (id)       => request(`/scores/${id}`, { method: 'DELETE' })

// ── DRAWS (public) ────────────────────────────────────────────────────────
export const getDraws      = ()   => request('/draws')
export const getDrawById   = (id) => request(`/draws/${id}`)
export const getLatestDraw = ()   => request('/draws/latest')

// ── CHARITIES ─────────────────────────────────────────────────────────────
export const getFeaturedCharities = ()         => request('/charities/featured')
export const getCharityBySlug     = (slug)     => request(`/charities/${slug}`)
export const getCharities         = (params={}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/charities${q ? `?${q}` : ''}`)
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────
export const createCheckout        = (plan) => request('/payments/create-checkout-session', { method: 'POST', body: JSON.stringify({ plan }) })
export const getSubscriptionStatus = ()     => request('/payments/subscription-status')
export const cancelSubscription    = ()     => request('/payments/cancel-subscription',     { method: 'POST' })
export const createPayment         = (body) => request('/payments', { method: 'POST', body: JSON.stringify(body) })

// ── ADMIN — USERS ─────────────────────────────────────────────────────────
export const adminGetUsers   = (params={}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/admin/users${q ? `?${q}` : ''}`)
}
export const adminGetUser    = (id)       => request(`/admin/users/${id}`)
export const adminUpdateUser = (id, body) => request(`/admin/users/${id}`, { method: 'PUT',    body: JSON.stringify(body) })
export const adminDeleteUser = (id)       => request(`/admin/users/${id}`, { method: 'DELETE' })

// ── ADMIN — DRAWS ─────────────────────────────────────────────────────────
// FIX: adminGetDraws now calls /draws/all to get draft + completed + published
export const adminGetDraws     = ()   => request('/draws/all')
export const adminSimulateDraw = ()   => request('/draws/simulate', { method: 'POST' })
export const adminRunDraw      = ()   => request('/draws/run',      { method: 'POST' })
export const adminPublishDraw  = (id) => request(`/draws/${id}/publish`, { method: 'PUT' })

// ── ADMIN — CHARITIES ─────────────────────────────────────────────────────
export const adminGetCharities  = ()          => request('/charities')
export const adminCreateCharity = (body)      => request('/charities',       { method: 'POST',   body: JSON.stringify(body) })
export const adminUpdateCharity = (id, body)  => request(`/charities/${id}`, { method: 'PUT',    body: JSON.stringify(body) })
export const adminDeleteCharity = (id)        => request(`/charities/${id}`, { method: 'DELETE' })

// ── ADMIN — WINNERS ───────────────────────────────────────────────────────
export const adminGetWinners   = (params={}) => {
  const q = new URLSearchParams(params).toString()
  return request(`/admin/winners${q ? `?${q}` : ''}`)
}
export const adminVerifyWinner = (id) => request(`/admin/winners/${id}/verify`, { method: 'PUT' })
export const adminMarkPaid     = (id) => request(`/admin/winners/${id}/paid`,   { method: 'PUT' })

// ── ADMIN — REPORTS ───────────────────────────────────────────────────────
export const adminGetReports = () => request('/admin/reports')