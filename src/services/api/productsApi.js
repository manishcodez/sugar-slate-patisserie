import { API_ENDPOINTS } from '../../config/api'
import { AUTH_STORAGE_KEY } from '../../data/adminConfig'
import { MENU_ITEMS } from '../../data/menuItems'
import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient'
import { attachProductImage, toStoredProduct } from '../../utils/productImages'

const STORAGE_KEY = 'ss-admin-products'

function readLocalProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw).map(attachProductImage)
  } catch { /* fall through */ }
  return MENU_ITEMS.map((p) => attachProductImage({ ...p, imageKey: `id-${p.id}` }))
}

export async function fetchProductsApi() {
  const res = await apiGet(API_ENDPOINTS.products.list, { auth: false })
  if (res.offline) return { ok: true, data: readLocalProducts(), offline: true }
  const products = (res.data?.products ?? []).map(attachProductImage)
  return { ok: true, data: products }
}

export async function createProductApi(product) {
  const res = await apiPost(API_ENDPOINTS.admin.products, toStoredProduct(product))
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: attachProductImage(res.data) }
}

export async function updateProductApi(id, updates) {
  const res = await apiPut(API_ENDPOINTS.admin.product(id), toStoredProduct(updates))
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: attachProductImage(res.data) }
}

export async function deleteProductApi(id) {
  const res = await apiDelete(API_ENDPOINTS.admin.product(id))
  if (res.offline) return { ok: false, offline: true }
  return { ok: true, data: res.data }
}

export async function resetProductsApi() {
  const res = await apiPost(API_ENDPOINTS.admin.productsReset, {})
  if (res.offline) {
    localStorage.removeItem(STORAGE_KEY)
    return { ok: true, data: readLocalProducts(), offline: true }
  }
  return { ok: true, data: (res.data?.products ?? []).map(attachProductImage) }
}

export function saveProductsLocally(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(toStoredProduct)))
}
