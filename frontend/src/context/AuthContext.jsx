import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const authRequest = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, { headers, ...options })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.response = { data }
    throw err
  }
  return data
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore session from token
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }

    authRequest('/users/me')
      .then((data) => {
        // FIX: /users/me returns { success, data: { user } }
        setUser(data.data?.user ?? data.data ?? data.user ?? data)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const data = await authRequest('/users/me')
      // FIX: same parse as above
      setUser(data.data?.user ?? data.data ?? data.user ?? data)
    } catch {
      setUser(null)
    }
  }, [])

  const login = async (email, password) => {
    // Backend returns: { success, token, data: { user } }
    const data = await authRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    // FIX: correct parse order
    const token    = data.token ?? data.data?.token
    const userData = data.data?.user ?? data.user ?? data.data
    if (token) localStorage.setItem('token', token)
    setUser(userData)
    return userData
  }

  const register = async (name, email, password) => {
    // Backend returns: { success, token, data: { user } }
    const data = await authRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    // FIX: correct parse order
    const token    = data.token ?? data.data?.token
    const userData = data.data?.user ?? data.user ?? data.data
    if (token) localStorage.setItem('token', token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}