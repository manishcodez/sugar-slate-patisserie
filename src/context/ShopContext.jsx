import { createContext, useContext, useState, useMemo } from 'react'

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [menuFilter, setMenuFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popularity')

  const value = useMemo(
    () => ({ menuFilter, setMenuFilter, searchQuery, setSearchQuery, sortBy, setSortBy }),
    [menuFilter, searchQuery, sortBy],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
