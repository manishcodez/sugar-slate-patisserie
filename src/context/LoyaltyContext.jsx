import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { API_ENABLED } from '../config/api'
import {
  fetchLoyaltyApi,
  saveLoyaltyLocally,
  readLocalLoyalty,
  EMPTY,
} from '../services/api/loyaltyApi'

const LoyaltyContext = createContext(null)

const POINTS_PER_100 = 1
const REDEEM_VALUE = 1

export function LoyaltyProvider({ children }) {
  const { user, ready } = useAuth()
  const [loyalty, setLoyalty] = useState(EMPTY)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const [offline, setOffline] = useState(!API_ENABLED)

  const refreshLoyalty = useCallback(async () => {
    if (!user?.id) {
      setLoyalty(EMPTY)
      return
    }
    const res = await fetchLoyaltyApi(user.id)
    if (res.ok) {
      setLoyalty(res.data || EMPTY)
      setOffline(Boolean(res.offline))
      if (res.offline) saveLoyaltyLocally(user.id, res.data)
    }
  }, [user?.id])

  useEffect(() => {
    if (!ready) return
    refreshLoyalty()
    setPointsToRedeem(0)
  }, [user?.id, ready, refreshLoyalty])

  useEffect(() => {
    if (user?.id && offline) saveLoyaltyLocally(user.id, loyalty)
  }, [loyalty, user?.id, offline])

  const earnPoints = useCallback((orderTotal, orderId) => {
    if (!user?.id) return 0
    if (!offline) {
      refreshLoyalty()
      return Math.floor(orderTotal / 100) * POINTS_PER_100
    }
    const earned = Math.floor(orderTotal / 100) * POINTS_PER_100
    if (earned <= 0) return 0
    setLoyalty((prev) => ({
      points: prev.points + earned,
      history: [
        { id: `earn-${Date.now()}`, type: 'earn', points: earned, orderId, orderTotal, date: new Date().toISOString() },
        ...prev.history.slice(0, 19),
      ],
    }))
    setPointsToRedeem(0)
    return earned
  }, [user?.id, offline, refreshLoyalty])

  const redeemPoints = useCallback((amount, orderId) => {
    if (!user?.id) return 0
    const redeem = Math.min(amount, loyalty.points)
    if (redeem <= 0) return 0
    if (!offline) return redeem
    setLoyalty((prev) => ({
      points: prev.points - redeem,
      history: [
        { id: `redeem-${Date.now()}`, type: 'redeem', points: redeem, orderId, date: new Date().toISOString() },
        ...prev.history.slice(0, 19),
      ],
    }))
    return redeem
  }, [user?.id, loyalty.points, offline])

  const maxRedeemable = useCallback(
    (orderSubtotal) => {
      if (!user?.id) return 0
      return Math.min(loyalty.points, Math.floor(orderSubtotal * 0.5))
    },
    [user?.id, loyalty.points],
  )

  const loyaltyDiscount = user?.id ? pointsToRedeem * REDEEM_VALUE : 0

  const value = useMemo(
    () => ({
      points: loyalty.points,
      history: loyalty.history,
      pointsToRedeem,
      setPointsToRedeem,
      earnPoints,
      redeemPoints,
      maxRedeemable,
      loyaltyDiscount,
      refreshLoyalty,
      pointsPer100: POINTS_PER_100,
      redeemValue: REDEEM_VALUE,
      isLoggedIn: Boolean(user),
      userName: user?.name || '',
    }),
    [loyalty, pointsToRedeem, earnPoints, redeemPoints, maxRedeemable, loyaltyDiscount, refreshLoyalty, user],
  )

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext)
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider')
  return ctx
}
