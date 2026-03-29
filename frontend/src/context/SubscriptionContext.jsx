import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { createCheckout, cancelSubscription as cancelSub, getSubscriptionStatus } from '../utils/api'

const SubscriptionContext = createContext(null)

export const SubscriptionProvider = ({ children }) => {
  const auth = useAuth()
  const [subStatus, setSubStatus]   = useState(null)
  const [loadingSub, setLoadingSub] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await getSubscriptionStatus()
      setSubStatus(res.data ?? res)
    } catch {
      setSubStatus(null)
    }
  }, [])

  const subscribe = useCallback(async (plan) => {
    setLoadingSub(true)
    try {
      const res = await createCheckout(plan)
      const url = res.data?.url ?? res.url
      if (url) {
        window.location.href = url
      } else {
        toast.success(`Subscribed to ${plan} plan! 🎉`)
        await fetchStatus()
        if (auth?.refreshUser) await auth.refreshUser()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Subscription failed')
    } finally {
      setLoadingSub(false)
    }
  }, [fetchStatus, auth])

  const cancelSubscription = useCallback(async () => {
    setLoadingSub(true)
    try {
      await cancelSub()
      toast.success('Subscription cancelled')
      await fetchStatus()
      if (auth?.refreshUser) await auth.refreshUser()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Cancellation failed')
    } finally {
      setLoadingSub(false)
    }
  }, [fetchStatus, auth])

  return (
    <SubscriptionContext.Provider value={{
      subStatus,
      loadingSub,
      fetchStatus,
      subscribe,
      cancelSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be inside SubscriptionProvider')
  return ctx
}