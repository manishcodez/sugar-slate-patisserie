import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { MENU_ITEMS } from '../data/menuItems'
import { API_ENABLED } from '../config/api'
import {
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  resetProductsApi,
  saveProductsLocally,
} from '../services/api/productsApi'
import { attachProductImage, toStoredProduct } from '../utils/productImages'
import vanillaBeanCheesecake from '../assets/images/products/vanilla-bean-cheesecake.jpg'

const ProductsContext = createContext(null)
const DEFAULT_IMAGE = vanillaBeanCheesecake

function loadLocalProducts() {
  return MENU_ITEMS.map((p) => attachProductImage({ ...p, imageKey: `id-${p.id}` }))
}

function getNextId(products) {
  const numeric = products.map((p) => p.id).filter((id) => typeof id === 'number')
  return numeric.length ? Math.max(...numeric) + 1 : 100
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(loadLocalProducts)
  const [loading, setLoading] = useState(API_ENABLED)
  const [offline, setOffline] = useState(!API_ENABLED)

  const refreshProducts = useCallback(async () => {
    setLoading(true)
    const res = await fetchProductsApi()
    if (res.ok) {
      setProducts(res.data)
      setOffline(Boolean(res.offline))
      if (res.offline) saveProductsLocally(res.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  useEffect(() => {
    if (offline) saveProductsLocally(products)
  }, [products, offline])

  const updateProduct = useCallback(async (id, updates) => {
    let previous
    setProducts((prev) => {
      previous = prev.find((p) => p.id === id)
      return prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    })
    if (!offline && previous) {
      try {
        await updateProductApi(id, { ...previous, ...updates })
      } catch {
        setProducts((prev) => prev.map((p) => (p.id === id ? previous : p)))
      }
    }
  }, [offline])

  const addProduct = useCallback(async ({ name, price, category }) => {
    const newProduct = {
      id: getNextId(products),
      name: name.trim(),
      price: Number(price),
      category,
      description: 'New product added via Admin Panel.',
      imageKey: 'default',
      image: DEFAULT_IMAGE,
      rating: 4.5,
      reviewCount: 0,
      popularity: 50,
    }
    if (!offline) {
      try {
        const res = await createProductApi(newProduct)
        if (res.ok) {
          setProducts((prev) => [...prev, res.data])
          return { ok: true }
        }
      } catch {
        return { ok: false, error: 'Could not save product' }
      }
    }
    setProducts((prev) => [...prev, newProduct])
    return { ok: true }
  }, [offline, products])

  const deleteProduct = useCallback(async (id) => {
    let previous
    setProducts((prev) => {
      previous = prev.find((p) => p.id === id)
      return prev.filter((p) => p.id !== id)
    })
    if (!offline) {
      try {
        await deleteProductApi(id)
      } catch {
        if (previous) setProducts((prev) => [...prev, previous])
      }
    }
  }, [offline])

  const resetProducts = useCallback(async () => {
    const res = await resetProductsApi()
    if (res.ok) setProducts(res.data)
    else setProducts(loadLocalProducts())
  }, [])

  const bestsellers = useMemo(
    () => products
      .filter((item) => item.badge === 'Bestseller' || item.popularity >= 88)
      .slice(0, 10),
    [products],
  )

  const value = useMemo(
    () => ({
      products,
      bestsellers,
      loading,
      offline,
      refreshProducts,
      updateProduct,
      addProduct,
      deleteProduct,
      resetProducts,
    }),
    [products, bestsellers, loading, offline, refreshProducts, updateProduct, addProduct, deleteProduct, resetProducts],
  )

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
