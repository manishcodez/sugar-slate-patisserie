import { DESIGN_IMAGES } from './images'

export const MESSAGE_MAX_LENGTH = 30
export const PHOTO_UPLOAD_FEE = 400

export const OCCASIONS = [
  { id: 'wedding', label: 'Wedding', icon: 'Heart' },
  { id: 'birthday', label: 'Birthday', icon: 'Cake' },
  { id: 'anniversary', label: 'Anniversary', icon: 'Gem' },
  { id: 'corporate', label: 'Corporate', icon: 'Briefcase' },
  { id: 'baby-shower', label: 'Baby Shower', icon: 'Baby' },
  { id: 'other', label: 'Other', icon: 'Sparkles' },
]

export const SHAPES = [
  { id: 'round', label: 'Round', priceMod: 0 },
  { id: 'square', label: 'Square', priceMod: 200 },
  { id: 'heart', label: 'Heart', priceMod: 400 },
  { id: 'rectangle', label: 'Rectangle', priceMod: 150 },
]

export const SIZES = [
  { id: '6in', label: '6" Round', servings: '8–10 guests', basePrice: 1800 },
  { id: '8in', label: '8" Round', servings: '14–18 guests', basePrice: 2800 },
  { id: '10in', label: '10" Round', servings: '24–30 guests', basePrice: 3800 },
  { id: 'tiered', label: 'Tiered (2–3)', servings: '40–80 guests', basePrice: 7500 },
]

export const SPONGES = [
  { id: 'vanilla-sponge', label: 'Vanilla Sponge', priceMod: 0 },
  { id: 'chocolate-sponge', label: 'Chocolate Sponge', priceMod: 100 },
  { id: 'red-velvet', label: 'Red Velvet', priceMod: 200 },
  { id: 'carrot', label: 'Carrot Walnut', priceMod: 150 },
]

export const CREAMS = [
  { id: 'buttercream', label: 'Buttercream', priceMod: 0 },
  { id: 'whipped-cream', label: 'Whipped Cream', priceMod: 0 },
  { id: 'cream-cheese', label: 'Cream Cheese Frosting', priceMod: 150 },
  { id: 'ganache', label: 'Chocolate Ganache', priceMod: 200 },
]

export const FILLINGS = [
  { id: 'none', label: 'No Filling', priceMod: 0 },
  { id: 'fruit', label: 'Fresh Fruit', priceMod: 250 },
  { id: 'chocolate-mousse', label: 'Chocolate Mousse', priceMod: 300 },
  { id: 'nutella', label: 'Nutella', priceMod: 350 },
  { id: 'cream-cheese-fill', label: 'Cream Cheese', priceMod: 280 },
]

export const LAYERS = [
  { id: '1', label: '1 Layer', count: 1, priceMod: 0 },
  { id: '2', label: '2 Layers', count: 2, priceMod: 400 },
  { id: '3', label: '3 Layers', count: 3, priceMod: 800 },
  { id: '4', label: '4 Layers', count: 4, priceMod: 1200 },
]

export const THEMES = [
  { id: 'classic', label: 'Classic Elegant', priceMod: 0 },
  { id: 'floral', label: 'Floral Garden', priceMod: 300 },
  { id: 'minimal', label: 'Minimal Modern', priceMod: 0 },
  { id: 'festive', label: 'Festive Celebration', priceMod: 400 },
  { id: 'kids', label: 'Kids Party', priceMod: 350 },
]

export const WEIGHTS = [
  { id: '0.5kg', label: '0.5 kg', kg: 0.5, basePrice: 900 },
  { id: '1kg', label: '1 kg', kg: 1, basePrice: 1600 },
  { id: '1.5kg', label: '1.5 kg', kg: 1.5, basePrice: 2200 },
  { id: '2kg', label: '2 kg', kg: 2, basePrice: 2800 },
  { id: '3kg+', label: '3 kg+ (Custom)', kg: 3, basePrice: 4200, isCustom: true },
]

export const FLAVORS = [
  { id: 'vanilla', label: 'Vanilla Bean', color: '#F5E6C8' },
  { id: 'chocolate', label: 'Belgian Chocolate', color: '#3D2314' },
  { id: 'saffron', label: 'Saffron Cardamom', color: '#FFD700' },
  { id: 'mango', label: 'Alphonso Mango', color: '#FFB347' },
  { id: 'pistachio', label: 'Pistachio Rose', color: '#A8D5A2' },
  { id: 'gulab', label: 'Gulab Jamun', color: '#8B2332' },
]

export const DESIGN_STYLES = [
  { id: 'minimalist', label: 'Minimalist', image: DESIGN_IMAGES.minimalist },
  { id: 'floral', label: 'Floral Marigold', image: DESIGN_IMAGES.floral },
  { id: 'drip', label: 'Elegant Drip', image: DESIGN_IMAGES.drip },
  { id: 'fondant', label: 'Fondant Art', image: DESIGN_IMAGES.fondant },
  { id: 'rustic', label: 'Rustic Naked', image: DESIGN_IMAGES.rustic },
]

export const ADDONS = [
  { id: 'flowers', label: 'Fresh Marigold Florals', price: 800, icon: 'Flower2' },
  { id: 'topper', label: 'Custom Topper', price: 600, icon: 'Crown' },
  { id: 'gold-leaf', label: 'Gold Leaf Detailing', price: 1200, icon: 'Star' },
  { id: 'message', label: 'Personalized Message', price: 300, icon: 'MessageSquare' },
  { id: 'macarons', label: 'Macarons Garnish', price: 900, icon: 'Cookie' },
]

export const CUSTOM_CAKE_MIN_LEAD_DAYS = 2

/** Demo blackout dates — bakery fully booked */
export const BLACKOUT_DATES = [
  '2026-10-20',
  '2026-10-21',
  '2026-11-14',
]

export const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '1:00 PM – 3:00 PM',
  '3:00 PM – 5:00 PM',
  '5:00 PM – 7:00 PM',
]

export const ORDER_TRACKING_STAGES = [
  { id: 'preparing', label: 'Preparing', description: 'Gathering ingredients & prepping your order' },
  { id: 'baking', label: 'Baking', description: 'Your cakes are in the oven' },
  { id: 'ready', label: 'Ready', description: 'Freshly finished and quality-checked' },
  { id: 'delivery', label: 'Out for Delivery', description: 'On the way to your doorstep' },
  { id: 'delivered', label: 'Delivered', description: 'Enjoy your treats!' },
]

/** Map order status to tracking step index (confirmed → preparing). */
export function getOrderTrackingIndex(status) {
  if (!status || status === 'cancelled') return -1
  if (status === 'confirmed') return 0
  const idx = ORDER_TRACKING_STAGES.findIndex((s) => s.id === status)
  return idx >= 0 ? idx : 0
}

export function isOrderTrackingComplete(status) {
  return status === 'delivered'
}

export function calculateEstimatedPrice({
  sizeId,
  weightId,
  shapeId,
  spongeId,
  creamId,
  fillingId,
  layersId,
  themeId,
  addons = [],
  customWeightKg = 3,
  hasPhoto = false,
  messageText = '',
}) {
  const size = SIZES.find((s) => s.id === sizeId)
  const weight = WEIGHTS.find((w) => w.id === weightId)
  const shape = SHAPES.find((s) => s.id === shapeId)
  const sponge = SPONGES.find((s) => s.id === spongeId)
  const cream = CREAMS.find((c) => c.id === creamId)
  const filling = FILLINGS.find((f) => f.id === fillingId)
  const layers = LAYERS.find((l) => l.id === layersId)
  const theme = THEMES.find((t) => t.id === themeId)

  let base = 0

  if (weight) {
    if (weight.isCustom) {
      const extraKg = Math.max(0, Number(customWeightKg) - 3)
      base = weight.basePrice + Math.round(extraKg * 750)
    } else {
      base = weight.basePrice
    }
  }

  if (size) {
    base += Math.round(size.basePrice * 0.2)
  }

  base += shape?.priceMod || 0
  base += sponge?.priceMod || 0
  base += cream?.priceMod || 0
  base += filling?.priceMod || 0
  base += layers?.priceMod || 0
  base += theme?.priceMod || 0

  const addonTotal = ADDONS
    .filter((a) => addons.includes(a.id) && a.id !== 'message')
    .reduce((sum, a) => sum + a.price, 0)

  const messageFee = addons.includes('message') && messageText.trim() ? 300 : 0
  const photoFee = hasPhoto ? PHOTO_UPLOAD_FEE : 0

  const min = base + addonTotal + messageFee + photoFee
  const max = min > 0 ? min + Math.round(min * 0.2) : 0

  return { min, max }
}
