import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import {
  AUTH_STORAGE_KEY,
  AUTH_SESSION_KEY,
  SEED_ADMIN,
  OWNER_EMAIL,
} from '../data/adminConfig'
import { sendAdminRequestEmail } from '../services/adminEmail'
import {
  loginApi,
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
  updateProfileApi,
  getProfileApi,
  logoutApi,
} from '../services/api/authApi'
import { API_ENABLED } from '../config/api'
import { setAuthToken } from '../services/apiClient'
import {
  getAllAdminRequests,
  addAdminRequest,
  updateRequestById,
  isEmailApproved,
  generateApprovalCode,
  hasCloudStore,
  saveAllAdminRequests,
  approveByCode as storeApproveByCode,
  approveByEmail as storeApproveByEmail,
} from '../services/adminRequestStore'

const AuthContext = createContext(null)

const RESET_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000

async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users))
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function ensureSeedAdmin() {
  const users = loadUsers()
  const exists = users.some((u) => u.role === 'admin')
  if (!exists) {
    const hash = await hashPassword(SEED_ADMIN.password)
    users.push({
      id: 'admin-1',
      name: SEED_ADMIN.name,
      email: SEED_ADMIN.email.toLowerCase(),
      passwordHash: hash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    })
    saveUsers(users)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [adminRequests, setAdminRequests] = useState([])

  const refreshAdminRequests = useCallback(async () => {
    const requests = await getAllAdminRequests()
    setAdminRequests(requests)
    return requests
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!API_ENABLED) {
        await ensureSeedAdmin()
        await refreshAdminRequests()
      }

      if (API_ENABLED) {
        try {
          const token = sessionStorage.getItem('ss-api-token')
          if (token) {
            const res = await getProfileApi()
            if (res.ok && res.data?.user && mounted) {
              const apiUser = res.data.user
              sessionStorage.setItem(
                AUTH_SESSION_KEY,
                JSON.stringify({ userId: apiUser.id, role: apiUser.role }),
              )
              setUser(apiUser)
              setReady(true)
              return
            }
            setAuthToken(null)
            sessionStorage.removeItem(AUTH_SESSION_KEY)
          }
        } catch {
          setAuthToken(null)
          sessionStorage.removeItem(AUTH_SESSION_KEY)
        }
        if (mounted) {
          setUser(null)
          setReady(true)
        }
        return
      }

      const session = loadSession()
      if (session) {
        const users = loadUsers()
        const found = users.find((u) => u.id === session.userId)
        if (found) {
          const { passwordHash, ...safe } = found
          if (mounted) setUser(safe)
        } else {
          sessionStorage.removeItem(AUTH_SESSION_KEY)
        }
      }
      if (mounted) setReady(true)
    })()
    return () => { mounted = false }
  }, [refreshAdminRequests])

  const persistSession = useCallback((u) => {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ userId: u.id, role: u.role }))
    const { passwordHash, ...safe } = u
    setUser(safe)
  }, [])

  const signup = useCallback(async ({ name, email, password }) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) return { ok: false, error: 'Please enter your name' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }

    if (API_ENABLED) {
      try {
        const res = await registerApi({ name: trimmedName, email: trimmedEmail, password })
        if (res.offline) {
          return { ok: false, error: 'Server unavailable. Please try again later.' }
        }
        if (res.ok && res.data?.user) {
          persistSession(res.data.user)
          return { ok: true }
        }
        return { ok: false, error: 'Registration failed' }
      } catch (err) {
        return { ok: false, error: err.message || 'Registration failed' }
      }
    }

    const users = loadUsers()
    if (users.some((u) => u.email === trimmedEmail)) {
      return { ok: false, error: 'An account with this email already exists' }
    }

    const passwordHash = await hashPassword(password)
    const newUser = {
      id: `user-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      role: 'user',
      phone: '',
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    persistSession(newUser)
    return { ok: true }
  }, [persistSession])

  const login = useCallback(async ({ email, password }) => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      return { ok: false, error: 'Email and password are required' }
    }

    if (API_ENABLED) {
      try {
        const res = await loginApi({ email: trimmedEmail, password })
        if (res.offline) {
          return { ok: false, error: 'Server unavailable. Please try again later.' }
        }
        if (res.ok && res.data?.user) {
          persistSession(res.data.user)
          return { ok: true, role: res.data.user.role }
        }
        return { ok: false, error: 'Incorrect email or password' }
      } catch (err) {
        return { ok: false, error: err.message || 'Login failed' }
      }
    }

    const users = loadUsers()
    const found = users.find((u) => u.email === trimmedEmail)
    if (!found) return { ok: false, error: 'No account found with this email' }

    const hash = await hashPassword(password)
    if (hash !== found.passwordHash) {
      return { ok: false, error: 'Incorrect password' }
    }

    persistSession(found)
    return { ok: true, role: found.role }
  }, [persistSession])

  const adminLogin = useCallback(async ({ email, password }) => {
    const result = await login({ email, password })
    if (!result.ok) return result

    if (result.role !== 'admin') {
      sessionStorage.removeItem(AUTH_SESSION_KEY)
      setAuthToken(null)
      setUser(null)
      return { ok: false, error: 'This account is not authorized for the store dashboard.' }
    }
    return { ok: true }
  }, [login])

  const submitAdminRequest = useCallback(async ({ name, email, phone, message }) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedMessage = message.trim()

    if (!trimmedName) return { ok: false, error: 'Please enter your name' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email' }
    }
    if (!trimmedMessage) return { ok: false, error: 'Please tell us why you need admin access' }

    const requests = await getAllAdminRequests()
    const existing = requests.find((r) => r.email === trimmedEmail && r.status === 'pending')
    if (existing) {
      return { ok: false, error: 'A pending request already exists for this email.' }
    }

    const users = loadUsers()
    if (users.some((u) => u.email === trimmedEmail && u.role === 'admin')) {
      return { ok: false, error: 'This email already has admin access. Please login.' }
    }

    const approvalCode = generateApprovalCode()

    const newRequest = {
      id: `req-${Date.now()}`,
      approvalCode,
      name: trimmedName,
      email: trimmedEmail,
      phone: phone?.trim() || '',
      message: trimmedMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    await addAdminRequest(newRequest)
    await refreshAdminRequests()

    try {
      await sendAdminRequestEmail({
        name: trimmedName,
        email: trimmedEmail,
        phone: phone?.trim(),
        message: trimmedMessage,
        approvalCode,
      })
    } catch (err) {
      return {
        ok: true,
        warning: `${err.message} Code: ${approvalCode} — approve in Settings.`,
        approvalCode,
      }
    }

    return { ok: true, approvalCode }
  }, [refreshAdminRequests])

  const approveByCode = useCallback(async (code) => {
    const result = await storeApproveByCode(code)
    if (result.ok) await refreshAdminRequests()
    return result.ok
      ? { ok: true, email: result.request.email, name: result.request.name }
      : result
  }, [refreshAdminRequests])

  const approveByEmail = useCallback(async (email) => {
    const result = await storeApproveByEmail(email)
    if (result.ok) await refreshAdminRequests()
    return result.ok
      ? { ok: true, email: result.request.email }
      : result
  }, [refreshAdminRequests])

  const approveAdminRequest = useCallback(async (requestId) => {
    const result = await updateRequestById(requestId, 'approved')
    if (!result.ok) return result
    await refreshAdminRequests()
    return { ok: true, email: result.request.email }
  }, [refreshAdminRequests])

  const rejectAdminRequest = useCallback(async (requestId) => {
    const result = await updateRequestById(requestId, 'rejected')
    if (!result.ok) return result
    await refreshAdminRequests()
    return { ok: true }
  }, [refreshAdminRequests])

  const setupAdminAccount = useCallback(async ({ name, email, password, confirm }) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) return { ok: false, error: 'Please enter your name' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }
    if (password !== confirm) {
      return { ok: false, error: 'Passwords do not match' }
    }

    const approved = await isEmailApproved(trimmedEmail)
    if (!approved) {
      return {
        ok: false,
        error: 'This email is not approved yet. Owner must approve in Admin Settings first.',
      }
    }

    const users = loadUsers()
    const existing = users.find((u) => u.email === trimmedEmail)
    if (existing?.role === 'admin') {
      return { ok: false, error: 'Admin account already exists. Please login.' }
    }

    const passwordHash = await hashPassword(password)
    let adminUser

    if (existing) {
      existing.role = 'admin'
      existing.passwordHash = passwordHash
      existing.name = trimmedName
      adminUser = existing
    } else {
      adminUser = {
        id: `admin-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      }
      users.push(adminUser)
    }

    saveUsers(users)

    const requests = await getAllAdminRequests()
    const reqIdx = requests.findIndex((r) => r.email === trimmedEmail && r.status === 'approved')
    if (reqIdx !== -1) {
      requests[reqIdx].status = 'completed'
      requests[reqIdx].completedAt = new Date().toISOString()
      await saveAllAdminRequests(requests)
      await refreshAdminRequests()
    }

    persistSession(adminUser)
    return { ok: true }
  }, [persistSession, refreshAdminRequests])

  const checkAdminApproval = useCallback(async (email) => {
    const trimmed = email.trim().toLowerCase()
    const users = loadUsers()
    if (users.some((u) => u.email === trimmed && u.role === 'admin')) {
      return 'has_account'
    }
    if (await isEmailApproved(trimmed)) return 'approved'
    const requests = await getAllAdminRequests()
    if (requests.some((r) => r.email === trimmed && r.status === 'pending')) return 'pending'
    return 'none'
  }, [])

  const logout = useCallback(async () => {
    if (API_ENABLED) {
      try {
        await logoutApi()
      } catch {
        setAuthToken(null)
      }
    }
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setUser(null)
  }, [])

  const forgotPassword = useCallback(async ({ email }) => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email' }
    }

    if (API_ENABLED) {
      try {
        const res = await forgotPasswordApi(trimmedEmail)
        if (!res.offline) {
          return {
            ok: true,
            message: res.data?.message || 'If an account exists, password reset instructions have been sent to your email.',
            devResetToken: res.data?.devResetToken,
            email: res.data?.email,
          }
        }
      } catch (err) {
        return { ok: false, error: err.message || 'Could not send reset email' }
      }
    }

    const users = loadUsers()
    if (!users.some((u) => u.email === trimmedEmail)) {
      return {
        ok: true,
        message: 'If an account exists, password reset instructions have been sent to your email.',
      }
    }

    const token = `reset-${Date.now()}`
    localStorage.setItem(`ss-reset-${trimmedEmail}`, JSON.stringify({ token, createdAt: Date.now() }))
    return {
      ok: true,
      message: 'Reset request received. You can now set a new password.',
      canResetLocally: true,
      email: trimmedEmail,
      offline: true,
    }
  }, [])

  const resetPassword = useCallback(async ({ email, password, confirm, token }) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedToken = String(token || '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email' }
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters' }
    }
    if (password !== confirm) {
      return { ok: false, error: 'Passwords do not match' }
    }

    if (API_ENABLED) {
      try {
        const res = await resetPasswordApi({ email: trimmedEmail, password, token: trimmedToken })
        if (!res.offline) {
          return { ok: true, message: 'Password updated successfully. You can login now.' }
        }
      } catch (err) {
        return { ok: false, error: err.message || 'Could not reset password' }
      }
    }

    const resetRaw = localStorage.getItem(`ss-reset-${trimmedEmail}`)
    if (!resetRaw) {
      return { ok: false, error: 'No reset request found. Please use Forgot Password first.' }
    }

    let resetData
    try {
      resetData = JSON.parse(resetRaw)
    } catch {
      return { ok: false, error: 'Invalid reset session. Please request again.' }
    }

    if (Date.now() - resetData.createdAt > RESET_TOKEN_MAX_AGE_MS) {
      localStorage.removeItem(`ss-reset-${trimmedEmail}`)
      return { ok: false, error: 'Reset link expired. Please request a new one.' }
    }

    const users = loadUsers()
    const idx = users.findIndex((u) => u.email === trimmedEmail)
    if (idx === -1) {
      return { ok: false, error: 'No account found with this email' }
    }

    const passwordHash = await hashPassword(password)
    users[idx].passwordHash = passwordHash
    saveUsers(users)
    localStorage.removeItem(`ss-reset-${trimmedEmail}`)

    return { ok: true, message: 'Password updated successfully. You can login now.' }
  }, [])

  const updateProfile = useCallback(async ({ name, phone }) => {
    if (!user) return { ok: false, error: 'Not logged in' }
    const trimmedName = name?.trim()
    if (!trimmedName) return { ok: false, error: 'Name is required' }

    if (API_ENABLED) {
      try {
        const res = await updateProfileApi({ name: trimmedName, phone: phone?.trim() || '' })
        if (!res.offline && res.ok && res.data?.user) {
          persistSession(res.data.user)
          return { ok: true, user: res.data.user }
        }
      } catch (err) {
        return { ok: false, error: err.message || 'Profile update failed' }
      }
    }

    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === user.id)
    if (idx === -1) return { ok: false, error: 'User not found' }

    users[idx].name = trimmedName
    users[idx].phone = phone?.trim() || ''
    saveUsers(users)
    persistSession(users[idx])
    return { ok: true }
  }, [user, persistSession])

  const isAdmin = user?.role === 'admin'
  const isOwner = user?.email === SEED_ADMIN.email.toLowerCase()
    || user?.email === OWNER_EMAIL.toLowerCase()

  const value = useMemo(
    () => ({
      user,
      ready,
      signup,
      login,
      adminLogin,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      isAdmin,
      isOwner,
      hasCloudStore,
      adminRequests,
      submitAdminRequest,
      approveByCode,
      approveByEmail,
      approveAdminRequest,
      rejectAdminRequest,
      setupAdminAccount,
      checkAdminApproval,
      refreshAdminRequests,
    }),
    [
      user,
      ready,
      signup,
      login,
      adminLogin,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      isAdmin,
      isOwner,
      adminRequests,
      submitAdminRequest,
      approveByCode,
      approveByEmail,
      approveAdminRequest,
      rejectAdminRequest,
      setupAdminAccount,
      checkAdminApproval,
      refreshAdminRequests,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
