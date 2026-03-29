import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <div className="w-10 h-10 rounded-full border-2 border-[#C8F04D] border-t-transparent animate-spin" />
  </div>
)

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user)                 return <Navigate to="/login"     replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

export default ProtectedRoute