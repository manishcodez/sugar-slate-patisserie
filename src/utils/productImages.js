import { MENU_ITEMS } from '../data/menuItems'
import vanillaBeanCheesecake from '../assets/images/products/vanilla-bean-cheesecake.jpg'

const DEFAULT_IMAGE = vanillaBeanCheesecake

const IMAGE_MAP = { default: DEFAULT_IMAGE }
MENU_ITEMS.forEach((p) => {
  IMAGE_MAP[`id-${p.id}`] = p.image
})

export function resolveProductImage(product) {
  const key = product.imageKey || `id-${product.id}`
  return IMAGE_MAP[key] || IMAGE_MAP[`id-${product.id}`] || DEFAULT_IMAGE
}

export function attachProductImage(product) {
  return { ...product, image: resolveProductImage(product) }
}

export function toStoredProduct(product) {
  const { image, ...rest } = product
  return { ...rest, imageKey: rest.imageKey || `id-${rest.id}` }
}
