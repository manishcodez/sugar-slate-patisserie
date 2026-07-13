import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CustomerPortalContext = createContext(null)

export function CustomerPortalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const openPortal = useCallback((tab = 'dashboard') => {
    setActiveTab(tab)
    setIsOpen(true)
  }, [])

  const closePortal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(
    () => ({ isOpen, activeTab, setActiveTab, openPortal, closePortal }),
    [isOpen, activeTab, openPortal, closePortal],
  )

  return (
    <CustomerPortalContext.Provider value={value}>
      {children}
    </CustomerPortalContext.Provider>
  )
}

export function useCustomerPortal() {
  const ctx = useContext(CustomerPortalContext)
  if (!ctx) throw new Error('useCustomerPortal must be used within CustomerPortalProvider')
  return ctx
}
