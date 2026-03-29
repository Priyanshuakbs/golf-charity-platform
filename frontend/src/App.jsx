import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy, Component } from 'react'
import { Loader2 } from 'lucide-react'

import { AuthProvider } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'

const Dashboard   = lazy(() => import('./pages/Dashboard'))
const ScoreEntry  = lazy(() => import('./pages/ScoreEntry'))
const DrawResults = lazy(() => import('./pages/DrawResults'))
const Subscribe   = lazy(() => import('./pages/Subscribe'))
const Charities   = lazy(() => import('./pages/Charities'))
const CharityDetail = lazy(() => import('./pages/CharityDetail'))
const Profile     = lazy(() => import('./pages/Profile'))
const MyWins      = lazy(() => import('./pages/MyWins'))
const AdminPanel  = lazy(() => import('./pages/admin/index'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808]">
      <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
    </div>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#080808', color: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 500, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#22c55e', color: '#000', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SubscriptionProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0f1117',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#0f1117' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#0f1117' } },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Full screen — no navbar */}
                <Route path="/login"                    element={<Login />} />
                <Route path="/register"                 element={<Register />} />
                <Route path="/forgot-password"          element={<ForgotPassword />} />
                <Route path="/reset-password/:token"    element={<ResetPassword />} />

                {/* Public */}
                <Route path="/"                element={<Layout><Home /></Layout>} />
                <Route path="/charities"       element={<Layout><Charities /></Layout>} />
                <Route path="/charities/:slug" element={<Layout><CharityDetail /></Layout>} />
                <Route path="/draws"           element={<Layout><DrawResults /></Layout>} />

                {/* Protected */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
                } />
                <Route path="/scores" element={
                  <ProtectedRoute><Layout><ScoreEntry /></Layout></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
                } />
                <Route path="/my-wins" element={
                  <ProtectedRoute><Layout><MyWins /></Layout></ProtectedRoute>
                } />
                <Route path="/subscription" element={
                  <ProtectedRoute><Layout><Subscribe /></Layout></ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin/*" element={
                  <AdminRoute><Layout><AdminPanel /></Layout></AdminRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}